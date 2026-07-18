export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  developerMessage?: string;
  data?: T;
  errors?: ApiErrorItem[];
  traceId?: string;
}
