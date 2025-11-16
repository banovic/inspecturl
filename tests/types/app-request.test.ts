import { describe, it, expect } from 'vitest';
import { createAppRequestFromString } from '../../src/types/app-request.js';

describe('createAppRequestFromString', () => {
    it('should create AppRequest from http://example.com', () => {
        const url = 'http://example.com';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: false,
                host: 'example.com',
                port: 80,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from http://example.com:9999', () => {
        const url = 'http://example.com:9999';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: false,
                host: 'example.com',
                port: 9999,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from https://example.com', () => {
        const url = 'https://example.com';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 443,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from https://example.com:9999', () => {
        const url = 'https://example.com:9999';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 9999,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from example.com (default to https)', () => {
        const url = 'example.com';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 443,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from 1.2.3.4 (default to https)', () => {
        const url = '1.2.3.4';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: true,
                isHttps: true,
                host: '1.2.3.4',
                port: 443,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from https://1.2.3.4', () => {
        const url = 'https://1.2.3.4';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: true,
                isHttps: true,
                host: '1.2.3.4',
                port: 443,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from https://1.2.3.4:9999', () => {
        const url = 'https://1.2.3.4:9999';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: true,
                isHttps: true,
                host: '1.2.3.4',
                port: 9999,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should create AppRequest from http://1.2.3.4:9999', () => {
        const url = 'http://1.2.3.4:9999';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: true,
                isHttps: false,
                host: '1.2.3.4',
                port: 9999,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should return undefined for invalid URL (empty string)', () => {
        const url = '';
        const req = createAppRequestFromString(url);

        expect(req).toBeUndefined();
    });

    it('should return undefined for invalid URL "some url" (malformed)', () => {
        const url = 'some url';
        const req = createAppRequestFromString(url);

        expect(req).toBeUndefined();
    });

    it('should return undefined for invalid URL "http://"', () => {
        const url = 'http://';
        const req = createAppRequestFromString(url);

        expect(req).toBeUndefined();
    });

    it('should (surprisingly not) return undefined for "http://:9999"', () => {
        const url = 'http://:9999';
        const req = createAppRequestFromString(url);

        expect(req).toBeUndefined();
    });

    it('should work with single-label domain "http://localhost"', () => {
        const url = 'http://localhost';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: false,
                host: 'localhost',
                port: 80,
                path: '/',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should work with URL with path and query string "https://example.com/some/path?query=1&foo=bar"', () => {
        const url = 'https://example.com/some/path?query=1&foo=bar';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 443,
                path: '/some/path',
                search: '?query=1&foo=bar',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should work with path only https://example.com/some/path/and/it/goes/and/goes', () => {
        const url = 'https://example.com/some/path/and/it/goes/and/goes';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 443,
                path: '/some/path/and/it/goes/and/goes',
                search: '',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });

    it('should work with query string only https://example.com?query=1', () => {
        const url = 'https://example.com?query=1';
        const req = createAppRequestFromString(url);

        expect(req).toBeDefined();
        if (req) {
            expect(req).toEqual({
                isIPv4: false,
                isHttps: true,
                host: 'example.com',
                port: 443,
                path: '/',
                search: '?query=1',
                method: 'GET',
                timeout: 5000,
                userAgent: 'UrlMonitor',
            });
        }
    });
});
