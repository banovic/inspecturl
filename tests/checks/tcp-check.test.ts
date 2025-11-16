import { describe, it, expect, vi } from 'vitest';
import { TcpCheck } from '../../src/checks/tcp-check.js';
import { mockAppRequest } from '../mocks/app-request.js';
import { createMockNetSocket } from '../mocks/deps.js';

describe('TcpCheck', () => {

    describe('run', () => {
        it('should return success on successful connection', async () => {
            const mockSocket = createMockNetSocket();
            const createSocket = vi.fn(() => (mockSocket));
            const tcpCheck = new TcpCheck(createSocket);
            const promise = tcpCheck.run(mockAppRequest);

            mockSocket.emit('connect', {});

            const result = await promise;

            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data?.responseTimeMs).toBeGreaterThanOrEqual(0);
            }
            expect(mockSocket.removeListener).toHaveBeenCalledTimes(3);
            expect(mockSocket.destroy).toHaveBeenCalled();
        });

        it('should return failure on connection error', async () => {
            const errorText = 'Connection refused';
            const mockSocket = createMockNetSocket();
            const createSocket = vi.fn(() => (mockSocket));
            const tcpCheck = new TcpCheck(createSocket);
            const promise = tcpCheck.run(mockAppRequest);

            mockSocket.emit('error', new Error(errorText));
            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).contains(errorText);
            }
            expect(mockSocket.removeListener).toHaveBeenCalledTimes(3);
            expect(mockSocket.destroy).toHaveBeenCalled();
        });

        it('should return failure on connection timeout', async () => {
            const mockSocket = createMockNetSocket();
            const createSocket = vi.fn(() => (mockSocket));
            const tcpCheck = new TcpCheck(createSocket);
            const promise = tcpCheck.run(mockAppRequest);

            mockSocket.emit('timeout', {});

            const result = await promise;

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).contains('Connection timed out');
            }
            expect(mockSocket.removeListener).toHaveBeenCalledTimes(3);
            expect(mockSocket.destroy).toHaveBeenCalled();
        });
    });
});