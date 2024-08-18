export const convertFileNameToNormal = (fileName: string): string => {
    if (fileName.length > 9) return fileName.substring(9);
    else return "";
};
