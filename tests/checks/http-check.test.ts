import http from 'http';
import { describe, it, expect, vi } from 'vitest';
import { HttpCheck } from '../../src/checks/http-check.js';
import { mockAppRequest } from '../mocks/app-request.js';
import { createMockHttpClientRequest, createMockHttpIncomingMessage } from '../mocks/deps.js';

describe('HttpCheck', () => {

    describe('run', () => {
        it('should return success on successful response', async () => {
            const mockRequest = createMockHttpClientRequest();
            const createClientRequest = vi.fn(() => (mockRequest));
            const httpCheck = new HttpCheck(createClientRequest);
            const promise = httpCheck.run(mockAppRequest);

            const mockResponse: http.IncomingMessage = createMockHttpIncomingMessage(200);
            mockRequest.emit('response', mockResponse);

            const result = await promise;

            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data).toEqual({
                    statusCode: 200,
                    responseTimeMs: expect.any(Number),
                });
            }
        });

        it('should return failure on request error', async () => {
            const errorText = 'Network error';
            const mockRequest = createMockHttpClientRequest();
            const createClientRequest = vi.fn(() => (mockRequest));
            const httpCheck = new HttpCheck(createClientRequest);
            const promise = httpCheck.run(mockAppRequest);

            mockRequest.emit('error', new Error(errorText));

            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).toBe('HTTP check failed: ' + errorText);
            }
        });

        it('should return failure on request timeout', async () => {
            const mockRequest = createMockHttpClientRequest();
            const createClientRequest = vi.fn(() => (mockRequest));
            const httpCheck = new HttpCheck(createClientRequest);
            const promise = httpCheck.run(mockAppRequest);

            mockRequest.emit('timeout', null);

            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).toBe('HTTP check failed: Request timed out');
            }
        });

        it('should use correct path and search from AppRequest', async () => {
            const mockRequest = createMockHttpClientRequest();
            const appRequest = {
                ...mockAppRequest,
                path: '/foo/bar/baz',
                search: '?p1=v1&p2=v2',
            };
            const createClientRequest = vi.fn(() => (mockRequest));
            const httpCheck = new HttpCheck(createClientRequest);
            const promise = httpCheck.run(appRequest);

            mockRequest.emit('response', createMockHttpIncomingMessage(200));

            const result = await promise;

            expect(createClientRequest).toHaveBeenCalledWith(
                appRequest.isHttps,
                expect.objectContaining({
                    path: '/foo/bar/baz?p1=v1&p2=v2',
                }),
            );

            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data).toEqual({
                    statusCode: 200,
                    responseTimeMs: expect.any(Number),
                });
            }
        });
    });
});
