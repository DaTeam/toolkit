export enum Type {
    Null = 1 << 0,
    Number = 1 << 1,
    String = 1 << 2,
    Boolean = 1 << 3,
    Date = 1 << 4,
    Object = 1 << 5,
    Array = 1 << 6,
    Function = 1 << 7,
    NonEmpty = 1 << 8,
    Valid = 1 << 9,
    Undefined = 1 << 10
}
export type AnyFunctionReturning<T> = (...args: any[]) => T;

/*
** Mapped types
*/
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Required<T> = { [P in keyof T]-?: T[P] };
export type ValuesOf<T extends readonly any[]> = T[number];
export type NonEmptyArray<T> = [T, ...T[]];

/*
 ** Common Types
 */
type CustomRange<S = any, E = any> = { start: S, end: E };


/*
 ** Custom Errors
 */

export class ServiceError extends Error {
    readonly code: string;
    readonly data?: any;

    constructor(code: string, msg?: string, data?: any) {
        super(msg);

        this.code = code;
        this.data = data;
    }
}

type HttpErrorExtraData = {
    msg?: string;
    data?: any;
    code?: string;
};

export enum HttpStatusCode {
    Ok = 200,
    BadRequest = 400,
    Unauthorized = 401,
    NotFound = 404,
    Conflict = 409,
    InternalError = 500,
    Forbidden = 403
}

export class HttpError extends Error {
    readonly statusCode: number;
    readonly data?: any;

    code?: string;

    constructor(statusCode: number, extraData?: HttpErrorExtraData) {
        super(extraData?.msg);

        this.statusCode = statusCode;
        this.code = extraData?.code;
        this.data = extraData?.data;
    }
}

export class BadRequestError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.BadRequest, { msg, data });
    }
}

export class UnauthorizedError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.Unauthorized, { msg, data });
    }
}

export class NotFoundError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.NotFound, { msg, data });
    }
}

export class InternalServerError extends HttpError {
    constructor(msg?: string, data?: any) {
        super(HttpStatusCode.InternalError, { msg, data });
    }
}
