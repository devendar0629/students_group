import fs from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

export const uploadFileToDisk = async (file: File, absolutePath: string) => {
    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        return pipeline(
            Readable.from(fileBuffer),
            fs.createWriteStream(absolutePath)
        );
    } catch (error) {
        throw new Error("Something went wrong");
    }
};
