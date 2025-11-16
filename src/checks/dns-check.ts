import { type Result, success, failure } from '../types/result.js';
import { type DnsResponse } from '../types/responses/dns-response.js';
import type { AppRequest } from '../types/app-request.js';

export class DnsCheck {

    constructor(
        private readonly resolve4: (domain: string) => Promise<string[]>,
    ) {
    }

    async run(req: AppRequest): Promise<Result<DnsResponse>> {
        try {
            const startTime = Date.now();
            const resolvedIps = await this.resolve4(req.host);
            if (resolvedIps.length === 0) {
                throw new Error('No IP addresses found for the domain.');
            }

            return success({
                resolvedIps,
                responseTimeMs: Date.now() - startTime,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return failure(`DNS resolution check failed: ${message}`);
        }
    }
}
