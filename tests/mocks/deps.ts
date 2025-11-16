import net from 'net';
import tls from 'node:tls';
import http from 'http';
import { Certificate } from 'node:crypto';
import { vi } from 'vitest';
import { Deps } from '../../src/types/deps.js';

interface MockEventEmitter {
    on: (event: string, listener: (...args: unknown[]) => void) => void;
    removeListener: (event: string) => void;
    removeAllListeners: () => void;
    emit: (event: string, data: unknown) => void;
}

const createMockEventEmitter: () => MockEventEmitter = () => {
    const eventHandlers: Record<string, (...args: unknown[]) => void> = {};

    return {
        on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
            eventHandlers[event] = listener;
        }),
        removeListener: vi.fn((event: string) => {
            delete eventHandlers[event];
        }),
        removeAllListeners: vi.fn(() => {
            Object.keys(eventHandlers).forEach((event) => {
                delete eventHandlers[event];
            });
        }),
        emit: vi.fn((event: string, data: unknown) => {
            if (eventHandlers[event]) {
                eventHandlers[event](data);
            }
        })
    };
};

export function createMockNetSocket(): net.Socket & MockEventEmitter {
    const mockSocket = {
        ...createMockEventEmitter(),
        setTimeout: vi.fn(),
        connect: vi.fn(),
        destroy: vi.fn(),
    };

    return mockSocket as unknown as net.Socket & MockEventEmitter;
}

export function createMockTLSSocket(): tls.TLSSocket & MockEventEmitter {
    const mockSocket = {
        ...createMockEventEmitter(),
        destroy: vi.fn(),
        getPeerCertificate: () => {
            const now = Date.now();
            const cert = {
                valid_from: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
                valid_to: new Date(now + 1000 * 60 * 60 * 24).toISOString(),
                issuer: {
                    CN: 'Mock Issuer',
                },
                subject: {
                    CN: 'example.com',
                },
            };
            return cert as unknown as Certificate;
        },
    };

    return mockSocket as unknown as tls.TLSSocket & MockEventEmitter;
}

export function createMockHttpClientRequest(): http.ClientRequest & MockEventEmitter {
    const mockRequest = {
        ...createMockEventEmitter(),
        destroy: vi.fn(),
        end: vi.fn(),
    };

    return mockRequest as unknown as http.ClientRequest & MockEventEmitter;
}

export function createMockHttpIncomingMessage(code: number = 200): http.IncomingMessage {
    return {
        statusCode: code,
        resume: vi.fn(),
    } as unknown as http.IncomingMessage;
};

/**
 * Create mock sockets, requests ... - and schedule emitting data that is needed for success.
 */
export function createSuccessDeps(): Deps {
    return {
        dnsResolve4: vi.fn(async () => {
            return ['1.2.3.4'];
        }),
        createNetSocket: vi.fn(() => { 
            const mockSocket = createMockNetSocket();
            setTimeout(() => mockSocket.emit('connect', null));
            return mockSocket;
        }),
        createTlsSocket: vi.fn(() => {
            const mockSocket = createMockTLSSocket();
            setTimeout(() => mockSocket.emit('secureConnect', null));
            return mockSocket;
        }),
        createHttpClientRequest: vi.fn(() => {
            const mockRequest = createMockHttpClientRequest();
            setTimeout(() => mockRequest.emit('response', createMockHttpIncomingMessage(200)));
            return mockRequest;
        }),
    };
}

export function createDnsFailureDeps(): Deps {
    return {
        dnsResolve4: vi.fn(async () => {
            throw new Error('DNS resolution failed');
        }),
        createNetSocket: vi.fn(() => {
            const mockSocket = createMockNetSocket();
            setTimeout(() => mockSocket.emit('connect', null));
            return mockSocket;
        }),
        createTlsSocket: vi.fn(() => {
            const mockSocket = createMockTLSSocket();
            setTimeout(() => mockSocket.emit('secureConnect', null));
            return mockSocket;
        }),
        createHttpClientRequest: vi.fn(() => {
            const mockRequest = createMockHttpClientRequest();
            setTimeout(() => mockRequest.emit('response', createMockHttpIncomingMessage(200)));
            return mockRequest;
        }),
    };
}

export function createTcpFailureDeps(): Deps {
    return {
        dnsResolve4: vi.fn(async () => {
            return ['1.2.3.4'];
        }),
        createNetSocket: vi.fn(() => {
            const mockSocket = createMockNetSocket();
            setTimeout(() => mockSocket.emit('error', new Error('Connection refused')));
            return mockSocket;
        }),
        createTlsSocket: vi.fn(() => {
            const mockSocket = createMockTLSSocket();
            setTimeout(() => mockSocket.emit('secureConnect', null));
            return mockSocket;
        }),
        createHttpClientRequest: vi.fn(() => {
            const mockRequest = createMockHttpClientRequest();
            setTimeout(() => mockRequest.emit('response', createMockHttpIncomingMessage(200)));
            return mockRequest;
        }),
    };
}

export function createHttpFailureDeps(): Deps {
    return {
        dnsResolve4: vi.fn(async () => {
            return ['1.2.3.4'];
        }),
        createNetSocket: vi.fn(() => {
            const mockSocket = createMockNetSocket();
            setTimeout(() => mockSocket.emit('connect', null));
            return mockSocket;
        }),
        createTlsSocket: vi.fn(() => {
            const mockSocket = createMockTLSSocket();
            setTimeout(() => mockSocket.emit('secureConnect', null));
            return mockSocket;
        }),
        createHttpClientRequest: vi.fn(() => {
            const mockRequest = createMockHttpClientRequest();
            setTimeout(() => mockRequest.emit('error', new Error('Network error')));
            return mockRequest;
        }),
    };
}

export function createSslFailureDeps(): Deps {
    return {
        dnsResolve4: vi.fn(async () => {
            return ['1.2.3.4'];
        }),
        createNetSocket: vi.fn(() => {
            const mockSocket = createMockNetSocket();
            setTimeout(() => mockSocket.emit('connect', null));
            return mockSocket;
        }),
        createTlsSocket: vi.fn(() => {
            const mockSocket = createMockTLSSocket();
            setTimeout(() => mockSocket.emit('error', new Error('SSL handshake failed')));
            return mockSocket;
        }),
        createHttpClientRequest: vi.fn(() => {
            const mockRequest = createMockHttpClientRequest();
            setTimeout(() => mockRequest.emit('response', createMockHttpIncomingMessage(200)));
            return mockRequest;
        }),
    };
}
