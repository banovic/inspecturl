import { describe, it, expect, vi } from 'vitest';
import { SslCheck } from '../../src/checks/ssl-check.js';
import { mockAppRequest } from '../mocks/app-request.js';
import { createMockTLSSocket } from '../mocks/deps.js';

describe('SslCheck', () => {

    describe('run', () => {
        it('should return success on valid SSL certificate', async () => {
            const mockSocket = createMockTLSSocket();
            const createSocket = vi.fn(() => mockSocket);
            const sslCheck = new SslCheck(createSocket);
            const promise = sslCheck.run(mockAppRequest);

            mockSocket.emit('secureConnect', {});

            const result = await promise;

            expect(result.status).toBe('success');
            if (result.status === 'success') {
                const now = new Date();
                expect(new Date(result.data.validTo) > now).toBe(true);
                expect(new Date(result.data.validFrom) <= now).toBe(true);
                expect(result.data.issuer).toBe('Mock Issuer');
                expect(result.data.subject).toBe('example.com');
                expect(result.data.responseTimeMs).toBeGreaterThanOrEqual(0);
                expect(result.data.isExpired).toBe(false);
                expect(result.data.isValidYet).toBe(true);
                expect(result.data.doesHostMatch).toBe(true);
            }
        });

        it('should return failure on connection error', async () => {
            const errorText = 'Connection refused';
            const mockSocket = createMockTLSSocket();
            const createSocket = vi.fn(() => (mockSocket));
            const sslCheck = new SslCheck(createSocket);
            const promise = sslCheck.run(mockAppRequest);
            
            mockSocket.emit('error', new Error(errorText));
            
            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).contains(errorText);
            }
        });

        it('should return failure on connection timeout', async () => {
            const mockSocket = createMockTLSSocket();
            const createSocket = vi.fn(() => (mockSocket));
            const sslCheck = new SslCheck(createSocket);
            const promise = sslCheck.run(mockAppRequest);
            
            mockSocket.emit('timeout', {});

            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).contains('Connection timed out');
            }
        });
    });
});