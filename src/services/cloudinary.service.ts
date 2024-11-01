import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

export class UploadService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(localFilePath: string, options?: UploadApiOptions) {
        return cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
            ...options,
        });
    }

    async uploadVideo(localFilePath: string, options?: UploadApiOptions) {
        return cloudinary.uploader.upload(localFilePath, {
            resource_type: "video",
            ...options,
        });
    }

    async uploadAny(localFilePath: string, options?: UploadApiOptions) {
        return cloudinary.uploader.upload(localFilePath, {
            ...options,
        });
    }
}

const uploadService = new UploadService();

export default uploadService;
