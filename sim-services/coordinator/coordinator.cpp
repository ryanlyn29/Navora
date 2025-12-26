#include <grpcpp/grpcpp.h>
#include <thread>
#include <mutex>
#include <unordered_map>
#include <vector>
#include <atomic>
#include <sstream>
#include <iomanip>
#include "sim.pb.h"
#include "sim.grpc.pb.h"
#include "../../sim-core/simulator.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;

class CoordinatorServiceImpl final : public navora::sim::SimulationCoordinator::Service {
public:
  CoordinatorServiceImpl() : sim_running_(false), next_entity_id_(0) {
    navora::physics::RigidBody floor_body;
    floor_body.is_static = true;
    floor_body.shape.type = navora::physics::ShapeType::PLANE;
    floor_body.shape.normal = navora::physics::Vector3(0, 1, 0);
    floor_body.shape.offset = 0.0;
    floor_body.transform.position = navora::physics::Vector3(0, -5, 0);
    sim_.create_entity("floor", floor_body);

    navora::physics::RigidBody sphere1_body;
    sphere1_body.mass = 1.0;
    sphere1_body.inv_mass = 1.0;
    sphere1_body.shape.type = navora::physics::ShapeType::SPHERE;
    sphere1_body.shape.size = navora::physics::Vector3(1.0, 1.0, 1.0);
    sphere1_body.transform.position = navora::physics::Vector3(0, 5, 0);
    sim_.create_entity("sphere_0", sphere1_body);

    navora::physics::RigidBody sphere2_body;
    sphere2_body.mass = 1.5;
    sphere2_body.inv_mass = 1.0 / 1.5;
    sphere2_body.shape.type = navora::physics::ShapeType::SPHERE;
    sphere2_body.shape.size = navora::physics::Vector3(0.8, 0.8, 0.8);
    sphere2_body.transform.position = navora::physics::Vector3(-2, 8, 0);
    sim_.create_entity("sphere_1", sphere2_body);

    sim_.start();
    sim_running_ = true;
    tick_thread_ = std::thread(&CoordinatorServiceImpl::tick_loop, this);
  }

  Status StartSimulation(ServerContext* context, const navora::sim::Command* request,
                         navora::sim::CommandResponse* response) override {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!sim_running_) {
      sim_.start();
      sim_running_ = true;
      tick_thread_ = std::thread(&CoordinatorServiceImpl::tick_loop, this);
      response->set_success(true);
      response->set_tick(sim_.get_tick());
    } else {
      response->set_success(false);
      response->set_error("Simulation already running");
    }
    return Status::OK;
  }

  Status StopSimulation(ServerContext* context, const navora::sim::Command* request,
                        navora::sim::CommandResponse* response) override {
    std::lock_guard<std::mutex> lock(mutex_);
    if (sim_running_) {
      sim_.stop();
      sim_running_ = false;
      response->set_success(true);
    } else {
      response->set_success(false);
      response->set_error("Simulation not running");
    }
    return Status::OK;
  }

  Status GetStatus(ServerContext* context, const navora::sim::Command* request,
                   navora::sim::SimulationStatus* response) override {
    std::lock_guard<std::mutex> lock(mutex_);
    response->set_running(sim_running_);
    response->set_current_tick(sim_.get_tick());
    response->set_sim_time(sim_.get_sim_time());
    response->set_consumer_count(consumers_.size());
    return Status::OK;
  }

  Status StreamState(ServerContext* context, const navora::sim::StreamRequest* request,
                     grpc::ServerWriter<navora::sim::StateDelta>* writer) override {
    std::string consumer_id = request->consumer_id();
    if (consumer_id.empty()) {
      consumer_id = "consumer_" + std::to_string(consumers_.size());
    }

    {
      std::lock_guard<std::mutex> lock(mutex_);
      consumers_[consumer_id] = true;
    }

    uint64_t last_tick = request->start_tick();
    bool sent_initial = false;
    
    while (!context->IsCancelled()) {
      std::this_thread::sleep_for(std::chrono::milliseconds(16));

      std::lock_guard<std::mutex> lock(mutex_);
      
      if (!sent_initial || sim_.get_tick() > last_tick) {
        navora::sim::StateDelta delta;
        auto* metadata = delta.mutable_metadata();
        metadata->set_tick(sim_.get_tick());
        metadata->set_sim_time(sim_.get_sim_time());
        metadata->set_delta_time(sim_.get_fixed_dt());

        auto entity_ids = sim_.get_all_entity_ids();
        for (const auto& id : entity_ids) {
          navora::physics::RigidBody body;
          if (sim_.get_entity(id, body)) {
            auto* updated = delta.add_updated();
            updated->set_id(id);
            auto* transform = updated->mutable_transform();
            transform->mutable_position()->set_x(body.transform.position.x);
            transform->mutable_position()->set_y(body.transform.position.y);
            transform->mutable_position()->set_z(body.transform.position.z);
            transform->mutable_rotation()->set_x(body.transform.rotation.x);
            transform->mutable_rotation()->set_y(body.transform.rotation.y);
            transform->mutable_rotation()->set_z(body.transform.rotation.z);
            transform->mutable_rotation()->set_w(body.transform.rotation.w);
            auto* physics = updated->mutable_physics();
            physics->mutable_linear_velocity()->set_x(body.linear_velocity.x);
            physics->mutable_linear_velocity()->set_y(body.linear_velocity.y);
            physics->mutable_linear_velocity()->set_z(body.linear_velocity.z);
            
            auto* shape = updated->mutable_shape();
            if (body.shape.type == navora::physics::ShapeType::SPHERE) {
              shape->set_type(navora::sim::CollisionShape::SPHERE);
            } else if (body.shape.type == navora::physics::ShapeType::PLANE) {
              shape->set_type(navora::sim::CollisionShape::PLANE);
            } else {
              shape->set_type(navora::sim::CollisionShape::AABB);
            }
            shape->mutable_size()->set_x(body.shape.size.x);
            shape->mutable_size()->set_y(body.shape.size.y);
            shape->mutable_size()->set_z(body.shape.size.z);
          }
        }

        if (!writer->Write(delta)) {
          break;
        }
        sent_initial = true;
        last_tick = sim_.get_tick();
      }
    }

    {
      std::lock_guard<std::mutex> lock(mutex_);
      consumers_.erase(consumer_id);
    }

    return Status::OK;
  }

  Status SendCommand(ServerContext* context, const navora::sim::Command* request,
                     navora::sim::CommandResponse* response) override {
    std::lock_guard<std::mutex> lock(mutex_);

    switch (request->type()) {
      case navora::sim::Command::APPLY_FORCE: {
        navora::physics::RigidBody body;
        if (sim_.get_entity(request->entity_id(), body)) {
          navora::physics::Vector3 force(
            request->force().x(),
            request->force().y(),
            request->force().z()
          );
          body.apply_force(force, navora::physics::DEFAULT_DELTA_TIME);
          sim_.update_entity(request->entity_id(), body);
          response->set_success(true);
        } else {
          response->set_success(false);
          response->set_error("Entity not found");
        }
        break;
      }
      case navora::sim::Command::APPLY_IMPULSE: {
        navora::physics::RigidBody body;
        if (sim_.get_entity(request->entity_id(), body)) {
          navora::physics::Vector3 impulse(
            request->force().x(),
            request->force().y(),
            request->force().z()
          );
          body.apply_impulse(impulse);
          sim_.update_entity(request->entity_id(), body);
          response->set_success(true);
        } else {
          response->set_success(false);
          response->set_error("Entity not found");
        }
        break;
      }
      case navora::sim::Command::SPAWN_ENTITY: {
        std::stringstream ss;
        ss << "entity_" << std::setfill('0') << std::setw(4) << next_entity_id_++;
        std::string id = ss.str();
        navora::physics::RigidBody body;
        body.transform.position = navora::physics::Vector3(
          request->position().x(),
          request->position().y(),
          request->position().z()
        );
        body.mass = request->mass() > 0 ? request->mass() : 1.0;
        body.inv_mass = 1.0 / body.mass;
        if (request->has_shape()) {
          if (request->shape().type() == navora::sim::CollisionShape::SPHERE) {
            body.shape.type = navora::physics::ShapeType::SPHERE;
            body.shape.size = navora::physics::Vector3(
              request->shape().size().x(),
              request->shape().size().y(),
              request->shape().size().z()
            );
          }
        } else {
          body.shape.type = navora::physics::ShapeType::SPHERE;
          body.shape.size = navora::physics::Vector3(1.0, 1.0, 1.0);
        }
        sim_.create_entity(id, body);
        response->set_success(true);
        break;
      }
      case navora::sim::Command::REMOVE_ENTITY: {
        sim_.remove_entity(request->entity_id());
        response->set_success(true);
        break;
      }
      case navora::sim::Command::RESET_SIM: {
        sim_.stop();
        sim_.reset();
        navora::physics::RigidBody floor_body;
        floor_body.is_static = true;
        floor_body.shape.type = navora::physics::ShapeType::PLANE;
        floor_body.shape.normal = navora::physics::Vector3(0, 1, 0);
        floor_body.transform.position = navora::physics::Vector3(0, -5, 0);
        sim_.create_entity("floor", floor_body);
        sim_.start();
        response->set_success(true);
        break;
      }
      default:
        response->set_success(false);
        response->set_error("Unknown command type");
    }

    response->set_tick(sim_.get_tick());
    return Status::OK;
  }

private:
  void tick_loop() {
    while (sim_running_) {
      {
        std::lock_guard<std::mutex> lock(mutex_);
        sim_.tick();
      }
      std::this_thread::sleep_for(std::chrono::milliseconds(16));
    }
  }

  navora::Simulator sim_;
  std::mutex mutex_;
  std::atomic<bool> sim_running_;
  std::thread tick_thread_;
  std::unordered_map<std::string, bool> consumers_;
  int next_entity_id_;
};

void RunServer() {
  std::string server_address("0.0.0.0:50051");
  CoordinatorServiceImpl service;

  ServerBuilder builder;
  builder.AddListeningPort(server_address, grpc::InsecureServerCredentials());
  builder.RegisterService(&service);

  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "Coordinator server listening on " << server_address << std::endl;
  server->Wait();
}

int main(int argc, char** argv) {
  RunServer();
  return 0;
}

