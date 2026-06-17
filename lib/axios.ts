import axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";

export interface ApiErrorResponse {
    error?: string;
    message?: string;
    code?: string;
    details?: unknown;
}

export class ApiError extends Error {
    readonly status: number | null;
    readonly code?: string;
    readonly details?: unknown;
    readonly originalError: unknown;

    constructor({
        status,
        message,
        code,
        details,
        originalError,
    }: {
        status: number | null;
        message: string;
        code?: string;
        details?: unknown;
        originalError: unknown;
    }) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.details = details;
        this.originalError = originalError;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

const apiClient = axios.create({
    baseURL: "/api",
    timeout: 15_000,
    withCredentials: true,

    validateStatus: (status) =>
        status >= 200 && status < 300,
});

/**
 * Request interceptor
 * ทำงานก่อนส่ง request ไปยัง API
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }

        config.headers.set("Accept", "application/json");

        /*
         * ถ้าใช้ Bearer Token ค่อยเปิดส่วนนี้
         *
         * if (typeof window !== "undefined") {
         *   const token = localStorage.getItem("accessToken");
         *
         *   if (token) {
         *     config.headers.set(
         *       "Authorization",
         *       `Bearer ${token}`,
         *     );
         *   }
         * }
         */

        /*
         * ใช้สำหรับตาม request ใน log
         */
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            config.headers.set(
                "X-Request-Id",
                crypto.randomUUID(),
            );
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(
            new ApiError({
                status: null,
                message:
                    "ไม่สามารถเตรียมคำขอไปยังเซิร์ฟเวอร์ได้",
                code: error.code,
                originalError: error,
            }),
        );
    },
);

/**
 * Response interceptor
 *
 * 2xx → สำเร็จ
 * 4xx/5xx → เข้า error handler
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },

    (error: AxiosError<ApiErrorResponse>) => {
        /*
         * Request ถูกยกเลิก
         */
        if (
            error.code === "ERR_CANCELED" ||
            axios.isCancel(error)
        ) {
            return Promise.reject(
                new ApiError({
                    status: null,
                    message: "คำขอถูกยกเลิก",
                    code: "REQUEST_CANCELLED",
                    originalError: error,
                }),
            );
        }

        /*
         * ไม่มี response จาก server
         */
        if (!error.response) {
            const isTimeout =
                error.code === "ECONNABORTED";

            return Promise.reject(
                new ApiError({
                    status: null,
                    message: isTimeout
                        ? "เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่"
                        : "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
                    code: isTimeout
                        ? "REQUEST_TIMEOUT"
                        : "NETWORK_ERROR",
                    originalError: error,
                }),
            );
        }

        const status = error.response.status;
        const responseData = error.response.data;

        const backendMessage =
            responseData?.error ||
            responseData?.message;

        const apiError = new ApiError({
            status,
            message:
                backendMessage ||
                getHttpErrorMessage(status),
            code:
                responseData?.code ||
                error.code ||
                `HTTP_${status}`,
            details: responseData?.details,
            originalError: error,
        });

        handleGlobalHttpError(apiError);

        return Promise.reject(apiError);
    },
);

function getHttpErrorMessage(
    status: number,
): string {
    switch (status) {
        case 400:
            return "ข้อมูลที่ส่งมาไม่ถูกต้อง";

        case 401:
            return "กรุณาเข้าสู่ระบบใหม่";

        case 403:
            return "คุณไม่มีสิทธิ์ดำเนินการนี้";

        case 404:
            return "ไม่พบข้อมูลที่ร้องขอ";

        case 405:
            return "ไม่รองรับวิธีการเรียก API นี้";

        case 408:
            return "คำขอใช้เวลานานเกินไป";

        case 409:
            return "ข้อมูลเกิดความขัดแย้ง";

        case 413:
            return "ข้อมูลหรือไฟล์มีขนาดใหญ่เกินไป";

        case 415:
            return "รูปแบบข้อมูลไม่รองรับ";

        case 422:
            return "ข้อมูลไม่ผ่านการตรวจสอบ";

        case 429:
            return "มีการเรียกใช้งานมากเกินไป กรุณารอสักครู่";

        case 500:
            return "ระบบภายในเกิดข้อผิดพลาด";

        case 501:
            return "ระบบยังไม่รองรับการทำงานนี้";

        case 502:
            return "เซิร์ฟเวอร์ปลายทางตอบกลับไม่ถูกต้อง";

        case 503:
            return "ระบบไม่พร้อมให้บริการชั่วคราว";

        case 504:
            return "เซิร์ฟเวอร์ตอบสนองช้าเกินไป";

        default:
            if (status >= 400 && status < 500) {
                return "คำขอไม่ถูกต้อง";
            }

            if (status >= 500) {
                return "ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง";
            }

            return `เกิดข้อผิดพลาด HTTP ${status}`;
    }
}

function handleGlobalHttpError(
    error: ApiError,
): void {
    if (typeof window === "undefined") {
        return;
    }

    switch (error.status) {
        case 401: {
            const isLoginPage =
                window.location.pathname ===
                "/admin/login";

            if (!isLoginPage) {
                const returnUrl =
                    encodeURIComponent(
                        window.location.pathname +
                        window.location.search,
                    );

                window.location.href =
                    `/admin/login?returnUrl=${returnUrl}`;
            }

            break;
        }

        case 403:
            window.dispatchEvent(
                new CustomEvent("api:forbidden", {
                    detail: error,
                }),
            );
            break;

        case 404:
            window.dispatchEvent(
                new CustomEvent("api:not-found", {
                    detail: error,
                }),
            );
            break;

        default:
            if (
                error.status !== null &&
                error.status >= 500
            ) {
                window.dispatchEvent(
                    new CustomEvent(
                        "api:server-error",
                        {
                            detail: error,
                        },
                    ),
                );
            }
    }
}

export default apiClient;