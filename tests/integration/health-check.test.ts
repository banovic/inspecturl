import { describe, expect, it } from "vitest";
import { createDnsFailureDeps, createHttpFailureDeps, createSslFailureDeps, createSuccessDeps, createTcpFailureDeps } from "../mocks/deps.js";
import { mockAppRequest, mockAppRequestWithIP } from "../mocks/app-request.js";
import { checkHealth } from "../../src/health-check.js";

describe("HealthCheck Integration Tests", () => {
    it('should successfully run checks for valid url (domain)', async () => {
        const mockDeps = createSuccessDeps();
        const result = await checkHealth(mockAppRequest, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('success');
        expect(result.tcp.status).toBe('success');
        expect(result.ssl.status).toBe('success');
        expect(result.http.status).toBe('success');
    })

    it('should successfully run checks for ip address', async () => {
        const mockDeps = createSuccessDeps();
        const result = await checkHealth(mockAppRequestWithIP, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('skipped');
        expect(result.tcp.status).toBe('success');
        expect(result.ssl.status).toBe('success');
        expect(result.http.status).toBe('success');
    })

    it('should handle DNS resolution errors', async () => {
        const mockDeps = createDnsFailureDeps();
        const result = await checkHealth(mockAppRequest, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('error');
        expect(result.tcp.status).toBe('skipped');
        expect(result.ssl.status).toBe('skipped');
        expect(result.http.status).toBe('skipped');
    })

    it('should handle TCP connection errors', async () => {
        const mockDeps = createTcpFailureDeps();
        const result = await checkHealth(mockAppRequest, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('success');
        expect(result.tcp.status).toBe('error');
        expect(result.ssl.status).toBe('skipped');
        expect(result.http.status).toBe('skipped');
    });

    it('should handle SSL handshake errors', async () => {
        const mockDeps = createSslFailureDeps();
        const result = await checkHealth(mockAppRequest, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('success');
        expect(result.tcp.status).toBe('success');
        expect(result.ssl.status).toBe('error');
        expect(result.http.status).toBe('success');
    });

    it('should handle HTTP request errors (network error)', async () => {
        const mockDeps = createHttpFailureDeps();
        const result = await checkHealth(mockAppRequest, mockDeps);

        expect(result).toBeDefined();
        expect(result.dns.status).toBe('success');
        expect(result.tcp.status).toBe('success');
        expect(result.ssl.status).toBe('success');
        expect(result.http.status).toBe('error');
    });
});