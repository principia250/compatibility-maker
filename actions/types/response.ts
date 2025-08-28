export interface Response<T> {
    data: T | null;
    error: ErrorResponse | null;
}

export interface ErrorResponse {
    message: string;
}
