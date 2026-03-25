const { Upload } = require('@aws-sdk/lib-storage');
const { s3Client } = require('../config/s3Config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload a file to AWS S3
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder in S3 bucket (e.g., 'avatars', 'toys')
 * @returns {Promise<string>} - The URL of the uploaded file
 */
const uploadFile = async (file, folder = 'others') => {
    try {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${folder}/${uuidv4()}${fileExtension}`;

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            },
        });

        const result = await upload.done();
        return result.Location; // Returns the full URL of the uploaded image
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload image to S3');
    }
};

/**
 * Delete a file from AWS S3
 * @param {string} fileUrl - The full URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        const urlSegments = fileUrl.split('/');
        const key = urlSegments.slice(3).join('/');

        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('S3 Delete Error:', error);
    }
};

/**
 * Upload multiple files to AWS S3
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - The folder in S3 bucket
 * @returns {Promise<Array<string>>} - Array of URLs
 */
const uploadMultipleFiles = async (files, folder = 'others') => {
    try {
        if (!files || files.length === 0) return [];

        const uploadPromises = files.map(file => uploadFile(file, folder));
        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('S3 Multiple Upload Error:', error);
        throw new Error('Failed to upload one or more images to S3');
    }
};

module.exports = {
    uploadFile,
    uploadMultipleFiles,
    deleteFile
};

