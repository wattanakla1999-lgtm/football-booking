import axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";

export interface ApiErrorResponse {
    error?: string;
    message?: string;
    details?: unknown;
    code?: string;
}

export interface NormalizedApiError {
    status: number | null;
    message: string;
    code?: string;
    details?: unknown;
    originalError: unknown;
}

/**
 * Error มาตรฐานของระบบ
 *
 * ทำให้ทุก Component สามารถใช้:
 * error.message
 * error.status
 * error.code
 *
 * ได้ในรูปแบบเดียวกัน
 */
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
    }: NormalizedApiError) {
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

    /*
     * ใช้ session/cookie ของระบบ
     * จำเป็นมากขึ้นเมื่อ Frontend กับ API อยู่คนละ origin
     */
    withCredentials: true,

    /*
     * Axios ค่าเริ่มต้นถือว่า 200–299 เป็น success
     * และสถานะอื่นเป็น error
     */
    validateStatus: (status) =>
        status >= 200 && status < 300,
});

function getBearerToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    const rawToken =
        window.localStorage.getItem("accessToken");

    if (!rawToken) {
        return null;
    }

    const token = rawToken.trim();

    if (
        token === "" ||
        token === "null" ||
        token === "undefined"
    ) {
        return null;
    }

    return token;
}

/**
 * REQUEST INTERCEPTOR
 *
 * ทำงานก่อน request ถูกส่งไปยัง API
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        /*
         * ไม่กำหนด Content-Type: application/json แบบ global
         * เพราะถ้าอนาคตส่ง FormData/ไฟล์ Axios จะจัดการ boundary ให้เอง
         */

        if (!config.headers) {
            config.headers = new AxiosHeaders();
        }

        config.headers.set("Accept", "application/json");

        const token = getBearerToken();

        if (token) {
            config.headers.set(
                "Authorization",
                `Bearer ${token}`,
            );
        } else {
            config.headers.delete("Authorization");
        }

        /*
         * เพิ่ม Request ID สำหรับตาม log ได้
         */
        if (typeof crypto !== "undefined") {
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
                message: "ไม่สามารถเตรียมคำขอไปยังเซิร์ฟเวอร์ได้",
                code: error.code,
                originalError: error,
            }),
        );
    },
);

/**
 * RESPONSE INTERCEPTOR
 *
 * Success handler จะทำงานกับ:
 * 200, 201, 202, 203, 204, 205, 206 และ 2xx อื่น ๆ
 *
 * Error handler จะทำงานกับ:
 * 400, 401, 403, 404, 409, 422, 429, 500 ฯลฯ
 */
apiClient.interceptors.response.use(
    (response) => {
        /*
         * ไม่จำเป็นต้อง switch 200/201/203
         * เพราะทั้งหมดถือว่า request สำเร็จ
         *
         * ปล่อย response กลับไปให้ service อ่าน response.data
         */
        return response;
    },

    (error: AxiosError<ApiErrorResponse>) => {
        /*
         * ผู้ใช้หรือระบบยกเลิก request
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
         * ส่ง request ออกไปแล้ว แต่ไม่ได้รับ response
         * เช่น อินเทอร์เน็ตหลุด, API ปิด, DNS มีปัญหา
         */
        if (!error.response) {
            const isTimeout = error.code === "ECONNABORTED";

            return Promise.reject(
                new ApiError({
                    status: null,
                    message: isTimeout
                        ? "เซิร์ฟเวอร์ตอบสนองช้าเกินไป กรุณาลองใหม่"
                        : "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต",
                    code: isTimeout
                        ? "REQUEST_TIMEOUT"
                        : "NETWORK_ERROR",
                    originalError: error,
                }),
            );
        }

        const status = error.response.status;
        const responseData = error.response.data;

        /*
         * ให้ข้อความจาก Backend มีลำดับความสำคัญก่อน
         */
        const backendMessage =
            responseData?.error ||
            responseData?.message;

        const defaultMessage =
            getHttpErrorMessage(status);

        const normalizedError = new ApiError({
            status,
            message: backendMessage || defaultMessage,
            code:
                responseData?.code ||
                error.code ||
                `HTTP_${status}`,
            details: responseData?.details,
            originalError: error,
        });

        /*
         * การจัดการแบบ global เฉพาะบาง status
         */
        handleGlobalHttpError(normalizedError);

        return Promise.reject(normalizedError);
    },
);

function getHttpErrorMessage(status: number): string {
    switch (status) {
        // ─────────────────────────────────────────────
        // Client errors
        // ─────────────────────────────────────────────

        case 400:
            return "ข้อมูลที่ส่งมาไม่ถูกต้อง";

        case 401:
            return "กรุณาเข้าสู่ระบบใหม่อีกครั้ง";

        case 402:
            return "จำเป็นต้องชำระเงินก่อนดำเนินการ";

        case 403:
            return "คุณไม่มีสิทธิ์ดำเนินการนี้";

        case 404:
            return "ไม่พบข้อมูลหรือหน้าที่ร้องขอ";

        case 405:
            return "ไม่รองรับวิธีการเรียก API นี้";

        case 406:
            return "รูปแบบข้อมูลที่ร้องขอไม่สามารถใช้งานได้";

        case 408:
            return "คำขอใช้เวลานานเกินไป กรุณาลองใหม่";

        case 409:
            return "ข้อมูลเกิดความขัดแย้ง กรุณาตรวจสอบอีกครั้ง";

        case 410:
            return "ข้อมูลนี้ถูกลบหรือไม่สามารถใช้งานได้แล้ว";

        case 412:
            return "เงื่อนไขของคำขอไม่ถูกต้อง";

        case 413:
            return "ไฟล์หรือข้อมูลที่ส่งมามีขนาดใหญ่เกินไป";

        case 415:
            return "รูปแบบไฟล์หรือข้อมูลไม่รองรับ";

        case 422:
            return "ข้อมูลบางส่วนไม่ผ่านการตรวจสอบ";

        case 423:
            return "ข้อมูลนี้กำลังถูกล็อกหรือใช้งานอยู่";

        case 429:
            return "มีการเรียกใช้งานมากเกินไป กรุณารอสักครู่";

        // ─────────────────────────────────────────────
        // Server errors
        // ─────────────────────────────────────────────

        case 500:
            return "ระบบภายในเกิดข้อผิดพลาด กรุณาลองใหม่";

        case 501:
            return "ระบบยังไม่รองรับการทำงานนี้";

        case 502:
            return "เซิร์ฟเวอร์ปลายทางตอบกลับไม่ถูกต้อง";

        case 503:
            return "ระบบไม่พร้อมให้บริการชั่วคราว";

        case 504:
            return "เซิร์ฟเวอร์ใช้เวลาตอบสนองนานเกินไป";

        case 505:
            return "HTTP Version นี้ไม่รองรับ";

        default:
            if (status >= 400 && status < 500) {
                return "คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูล";
            }

            if (status >= 500) {
                return "ระบบเกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง";
            }

            return `เกิดข้อผิดพลาด HTTP ${status}`;
    }
}

/**
 * จัดการพฤติกรรมที่ต้องทำทั้งระบบ
 *
 * หมายเหตุ:
 * ไม่ควร alert ทุก error ที่นี่
 * เพราะ Component อาจต้องแสดง error ในตำแหน่งของตัวเอง
 */
function handleGlobalHttpError(error: ApiError): void {
    if (typeof window === "undefined") {
        return;
    }

    switch (error.status) {
        case 401: {
            /*
             * ป้องกัน redirect loop ในหน้า login
             */
            const isLoginPage =
                window.location.pathname === "/admin/login";

            if (!isLoginPage) {
                const returnUrl = encodeURIComponent(
                    window.location.pathname +
                    window.location.search,
                );

                window.location.href =
                    `/admin/login?returnUrl=${returnUrl}`;
            }

            break;
        }

        case 403:
            /*
             * ส่ง event ให้ UI กลางรับไปแสดง toast/modal ได้
             */
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

        case 429:
            window.dispatchEvent(
                new CustomEvent("api:rate-limit", {
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
                    new CustomEvent("api:server-error", {
                        detail: error,
                    }),
                );
            }
    }
}

export default apiClient;
