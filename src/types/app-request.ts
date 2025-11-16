import { isIPv4 } from "net";

export interface AppRequest {
    isIPv4: boolean,
    isHttps: boolean,
    host: string,
    port: number,
    path: string,
    search: string, // query string
    method: 'GET' | 'HEAD',
    timeout: number,
    userAgent: string,
}

export function createAppRequestFromString(s: string): AppRequest | undefined{
    if (!s.startsWith('http://') && !s.startsWith('https://')) {
        s = 'https://' + s;
    }

    const url = URL.parse(s);
    if (url === null || !url.hostname) {
        return undefined;
    }

    let urlPort: number = url.port ? parseInt(url.port, 10) : 0;
    const isHttps: boolean = (url.protocol || 'https:').toLowerCase() === 'https:';

    if (!isHttps && urlPort === 0) {
        urlPort = 80;
    }

    if (isHttps && urlPort === 0) {
        urlPort = 443;
    }

    return {
        isIPv4: isIPv4(url.hostname),
        isHttps: isHttps,
        host: url.hostname,
        port: urlPort,
        path: url.pathname || '/',
        search: url.search || '',
        method: 'GET',
        timeout: 5000,
        userAgent: 'UrlMonitor',
    };
}
