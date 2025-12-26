#include "usd_file_export.h"
#include <pxr/usd/usd/stage.h>
#include <pxr/usd/usd/usdaFileFormat.h>
#include <pxr/usd/usd/usdcFileFormat.h>
#include <fstream>
#include <sstream>

namespace navora::usd {

bool USDFileExporter::export_to_file(const scene::USDScene& scene, const std::string& filepath) const {
  auto stage = scene.get_stage();
  if (!stage) {
    return false;
  }

  std::string extension = filepath.substr(filepath.find_last_of(".") + 1);
  if (extension == "usda") {
    return stage->Export(filepath, false);
  } else if (extension == "usdc") {
    return stage->Export(filepath, true);
  } else {
    return stage->Export(filepath + ".usda", false);
  }
}

bool USDFileExporter::export_to_string(const scene::USDScene& scene, std::string& output) const {
  auto stage = scene.get_stage();
  if (!stage) {
    return false;
  }

  std::stringstream ss;
  stage->ExportToString(&ss);
  output = ss.str();
  return true;
}

}

