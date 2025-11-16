import { describe, it, expect, vi } from 'vitest';
import { DnsCheck } from '../../src/checks/dns-check.js';
import { mockAppRequest } from '../mocks/app-request.js';

describe('DnsCheck', () => {

    describe('run', () => {
        it('should return success with resolved IPs when DNS resolution succeeds', async () => {
            const mockIPs = ['1.2.3.4', '5.6.7.8'];
            const mockResolve4 = vi.fn().mockResolvedValue(mockIPs);
            const dnsCheck = new DnsCheck(mockResolve4);
            const result = await dnsCheck.run(mockAppRequest);
            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data.resolvedIps).toEqual(mockIPs);
                expect(result.data.responseTimeMs).toBeGreaterThanOrEqual(0);
            }
            expect(mockResolve4).toHaveBeenCalledWith('example.com');
            expect(mockResolve4).toHaveBeenCalledTimes(1);
        });

        it('should return success with single IP when DNS resolves to one address', async () => {
            const mockIPs = ['1.2.3.4'];
            const mockResolve4 = vi.fn().mockResolvedValue(mockIPs);
            const dnsCheck = new DnsCheck(mockResolve4);
            const result = await dnsCheck.run(mockAppRequest);

            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data.resolvedIps).toEqual(mockIPs);
                expect(result.data.responseTimeMs).toBeGreaterThanOrEqual(0);
            }
            expect(mockResolve4).toHaveBeenCalledWith('example.com');
            expect(mockResolve4).toHaveBeenCalledTimes(1);
        });

        it('should measure response time correctly', async () => {
            const mockResolve4 = vi.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return ['1.2.3.4'];
            });
            const dnsCheck = new DnsCheck(mockResolve4);
            const result = await dnsCheck.run(mockAppRequest);

            expect(mockResolve4).toHaveBeenCalledWith('example.com');
            expect(result.status).toBe('success');
            if (result.status === 'success') {
                expect(result.data.responseTimeMs).toBeGreaterThanOrEqual(50);
                expect(result.data.responseTimeMs).toBeLessThan(100);
            }
        });

        it('should return failure when DNS resolution fails with Error', async () => {
            const errorMessage = 'ENOTFOUND: Domain not found';
            const mockResolve4 = vi.fn().mockRejectedValue(new Error(errorMessage));
            const dnsCheck = new DnsCheck(mockResolve4);

            const result = await dnsCheck.run(mockAppRequest);

            expect(mockResolve4).toHaveBeenCalledWith('example.com');
            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).toContain('DNS resolution check failed');
                expect(result.error).toContain(errorMessage);
            }
        });

        it('should return failure when DNS resolution fails with non-Error exception', async () => {
            const errorMessage = 'Network timeout';
            const mockResolve4 = vi.fn().mockRejectedValue(errorMessage);
            const dnsCheck = new DnsCheck(mockResolve4);
            const result = await dnsCheck.run(mockAppRequest);

            expect(mockResolve4).toHaveBeenCalledWith('example.com');
            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).toContain('DNS resolution check failed');
                expect(result.error).toContain(errorMessage);
            }
        });

        it('should handle resolved empty IP array', async () => {
            const mockResolve4 = vi.fn().mockResolvedValue([]);
            const dnsCheck = new DnsCheck(mockResolve4);
            const result = await dnsCheck.run(mockAppRequest);

            expect(result.status).toBe('error');
            if (result.status === 'error') {
                expect(result.error).toContain('DNS resolution check failed');
                expect(result.error).toContain('No IP addresses found');
            }
        });

        it('should handle multiple concurrent DNS checks', async () => {
            const mockResolve4 = vi.fn().mockResolvedValue(['1.2.3.4']);
            const dnsCheck = new DnsCheck(mockResolve4);

            const results = await Promise.all([
                dnsCheck.run(mockAppRequest),
                dnsCheck.run(mockAppRequest),
                dnsCheck.run(mockAppRequest),
            ]);

            results.forEach(result => {
                expect(result.status).toBe('success');
            });
            expect(mockResolve4).toHaveBeenCalledTimes(3);
        });
    });
});
