const ClinicSettings = require("../models/ClinicSettingsModel");

exports.getClinicSettings = async (req, res) => {
  try {
    let settings = await ClinicSettings.findOne();

    if (!settings) {
      settings = await ClinicSettings.create({
        clinicName: "Paws & Care Veterinary Clinic",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateClinicSettings = async (req, res) => {
  try {
    let settings = await ClinicSettings.findOne();

    if (!settings) {
      settings = await ClinicSettings.create(req.body);
    } else {
      settings = await ClinicSettings.findByIdAndUpdate(
        settings._id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Clinic settings updated successfully",
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadClinicLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Logo file is required",
      });
    }

    let settings = await ClinicSettings.findOne();

    if (!settings) {
      settings = await ClinicSettings.create({
        clinicName: "Paws & Care Veterinary Clinic",
      });
    }

    settings.logo = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: settings.logo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};