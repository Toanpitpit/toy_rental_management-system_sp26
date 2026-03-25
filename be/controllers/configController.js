const Config = require('../models/Config');

// GET /api/config/:key
exports.getConfigByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const config = await Config.findOne({ key });
    
    if (!config) {
      return res.status(404).json({ success: false, message: `Config with key '${key}' not found.` });
    }

    res.json({ success: true, data: config.value });
  } catch (error) {
    next(error);
  }
};

// GET /api/configs
exports.getAllConfigs = async (req, res, next) => {
  try {
    const configs = await Config.find();
    res.json({ success: true, data: configs });
  } catch (error) {
    next(error);
  }
};

// PUT /api/config/:key
exports.updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    const config = await Config.findOneAndUpdate(
      { key },
      { value, description },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Config updated successfully', data: config });
  } catch (error) {
    next(error);
  }
};
