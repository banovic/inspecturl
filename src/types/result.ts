export type Result<T> =
    | { status: 'success'; data: T }
    | { status: 'error'; error: string }
    | { status: 'skipped'; reason: string };

export function success<T>(data: T): Result<T> {
    return { status: 'success', data };
}

export function failure<T = never>(errorMessage: string): Result<T> {
    return { status: 'error', error: errorMessage };
}

export function skipped<T = never>(reason: string = ''): Result<T> {
    return { status: 'skipped', reason };
}

