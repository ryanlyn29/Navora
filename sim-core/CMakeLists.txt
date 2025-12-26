cmake_minimum_required(VERSION 3.15)
project(navora_sim_core)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(USD REQUIRED)

add_library(sim_core
  physics/rigid_body.h
  physics/integrator.h
  physics/integrator.cpp
  scene/usd_scene.h
  scene/usd_scene.cpp
  usd/usd_export.h
  usd/usd_export.cpp
  usd/usd_file_export.h
  usd/usd_file_export.cpp
  simulator.h
  simulator.cpp
)

target_include_directories(sim_core PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_include_directories(sim_core PRIVATE ${USD_INCLUDE_DIR})
target_link_libraries(sim_core ${USD_LIBRARIES})

add_executable(sim_runner main.cpp)
target_link_libraries(sim_runner sim_core)

