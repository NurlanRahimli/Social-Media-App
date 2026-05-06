const cloudinary = require("./cloudinary");

const uploadToCloudinary = (fileBuffer, folder = "social-posts") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
};

module.exports = uploadToCloudinary;