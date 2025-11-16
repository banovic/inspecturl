import { AppRequest } from '../../src/types/app-request.js';

export const mockAppRequest: AppRequest = {
    isIPv4: false,
    isHttps: true,
    host: 'example.com',
    port: 443,
    path: '/',
    search: '',
    method: 'GET',
    timeout: 5000,
    userAgent: 'UrlMonitor',
};

export const mockAppRequestWithIP: AppRequest = {
    isIPv4: true,
    isHttps: true,
    host: '12.34.56.78',
    port: 443,
    path: '/',
    search: '',
    method: 'GET',
    timeout: 5000,
    userAgent: 'UrlMonitor',
};
