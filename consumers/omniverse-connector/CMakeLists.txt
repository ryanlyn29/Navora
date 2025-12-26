cmake_minimum_required(VERSION 3.15)
project(navora_omniverse_connector)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Protobuf REQUIRED)
find_package(PkgConfig REQUIRED)
pkg_check_modules(GRPC REQUIRED grpc++)
find_package(USD REQUIRED)

set(PROTO_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../sim-services/coordinator/sim.proto")
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

add_executable(omniverse_connector
  connector.cpp
  ${PROTO_SRCS}
  ${GRPC_SRCS}
)

target_include_directories(omniverse_connector PRIVATE
  ${CMAKE_CURRENT_BINARY_DIR}
  ${GRPC_INCLUDE_DIRS}
)

target_link_directories(omniverse_connector PRIVATE ${GRPC_LIBRARY_DIRS})

target_link_libraries(omniverse_connector
  ${GRPC_LIBRARIES}
  protobuf::libprotobuf
  ${USD_LIBRARIES}
)

target_include_directories(omniverse_connector PRIVATE ${USD_INCLUDE_DIR})
target_compile_options(omniverse_connector PRIVATE ${GRPC_CFLAGS_OTHER})

