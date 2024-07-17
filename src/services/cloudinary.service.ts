import { v2 as cloudinary } from "cloudinary";

export class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(localFilePath: string, folder: string = "") {
        return cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "image",
        });
    }

    async uploadVideo(localFilePath: string, folder: string = "") {
        return cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "video",
        });
    }
}

export default new UploadService();
