interface ApiResponse {
    success: boolean;
    message?: string;
    error?: {
        message: string;
        cause?: string;
    };
    data?: any;
}
