#pragma once

#include "../scene/usd_scene.h"
#include <string>

namespace navora::usd {

class USDFileExporter {
public:
  bool export_to_file(const scene::USDScene& scene, const std::string& filepath) const;
  bool export_to_string(const scene::USDScene& scene, std::string& output) const;
};

}

