cmake_minimum_required(VERSION 3.15)
project(navora_coordinator)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Protobuf REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_check_modules(GRPC REQUIRED grpc++)
pkg_check_modules(GRPC_UNSECURE REQUIRED grpc++_unsecure)

set(PROTO_PATH "${CMAKE_CURRENT_SOURCE_DIR}/sim.proto")
get_filename_component(PROTO_NAME ${PROTO_PATH} NAME_WE)
get_filename_component(PROTO_DIR ${PROTO_PATH} DIRECTORY)

set(PROTO_SRCS "${CMAKE_CURRENT_BINARY_DIR}/${PROTO_NAME}.pb.cc")
set(PROTO_HDRS "${CMAKE_CURRENT_BINARY_DIR}/${PROTO_NAME}.pb.h")
set(GRPC_SRCS "${CMAKE_CURRENT_BINARY_DIR}/${PROTO_NAME}.grpc.pb.cc")
set(GRPC_HDRS "${CMAKE_CURRENT_BINARY_DIR}/${PROTO_NAME}.grpc.pb.h")

find_program(GRPC_CPP_PLUGIN grpc_cpp_plugin REQUIRED)

add_custom_command(
  OUTPUT "${PROTO_SRCS}" "${PROTO_HDRS}" "${GRPC_SRCS}" "${GRPC_HDRS}"
  COMMAND protobuf::protoc
  ARGS --grpc_out "${CMAKE_CURRENT_BINARY_DIR}"
    --cpp_out "${CMAKE_CURRENT_BINARY_DIR}"
    -I "${PROTO_DIR}"
    --plugin=protoc-gen-grpc="${GRPC_CPP_PLUGIN}"
    "${PROTO_PATH}"
  DEPENDS "${PROTO_PATH}")

get_filename_component(SIM_CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../sim-core" ABSOLUTE)
if(NOT EXISTS "${SIM_CORE_DIR}")
  get_filename_component(SIM_CORE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../sim-core" ABSOLUTE)
endif()
if(EXISTS "${SIM_CORE_DIR}/CMakeLists.txt")
  add_subdirectory(${SIM_CORE_DIR} sim_core_build)
else()
  message(FATAL_ERROR "Cannot find sim-core at ${SIM_CORE_DIR}")
endif()

add_executable(coordinator
  coordinator.cpp
  ${PROTO_SRCS}
  ${GRPC_SRCS}
)

target_include_directories(coordinator PRIVATE
  ${CMAKE_CURRENT_BINARY_DIR}
  ${SIM_CORE_DIR}
  ${GRPC_INCLUDE_DIRS}
)

target_link_directories(coordinator PRIVATE ${GRPC_LIBRARY_DIRS})

target_link_libraries(coordinator
  ${GRPC_LIBRARIES}
  protobuf::libprotobuf
  sim_core
)

target_compile_options(coordinator PRIVATE ${GRPC_CFLAGS_OTHER})

