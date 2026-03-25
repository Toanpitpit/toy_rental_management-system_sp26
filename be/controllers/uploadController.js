const s3Service = require('../services/s3Service');

exports.uploadImages = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 ảnh để tải lên.' });
    }

    const folder = req.body.folder || 'inspections';
    const imageUrls = await s3Service.uploadMultipleFiles(files, folder);

    res.status(200).json({
      success: true,
      data: {
        urls: imageUrls,
      },
      message: 'Tải lên ảnh thành công!'
    });
  } catch (error) {
    next(error);
  }
};
