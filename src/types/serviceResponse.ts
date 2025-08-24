export interface ServiceResponse {
    errCode: number;
    message: string;
    data?: any;
    access_token?: string;
    refresh_token?: string;
}