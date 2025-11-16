import { DnsCheck } from './checks/dns-check.js';
import { TcpCheck } from './checks/tcp-check.js';
import { HttpCheck } from './checks/http-check.js';
import { SslCheck } from './checks/ssl-check.js';
import { skipped } from './types/result.js';

import { type DnsResponse } from './types/responses/dns-response.js';
import { type TcpResponse } from './types/responses/tcp-response.js';
import { type HttpResponse } from './types/responses/http-response.js';
import { type SSLCertResponse } from './types/responses/ssl-response.js';
import { type HealthReport } from './types/health-report.js';
import { type AppRequest } from './types/app-request.js';
import type { Deps } from './types/deps.js';

/**
 * Composition root.
 */
export async function checkHealth(appRequest: AppRequest, deps: Deps): Promise<HealthReport> {
    const dnsCheck = new DnsCheck(deps.dnsResolve4);
    const tcpCheck = new TcpCheck(deps.createNetSocket);
    const httpCheck = new HttpCheck(deps.createHttpClientRequest);
    const sslCheck = new SslCheck(deps.createTlsSocket);

    const dnsResult = appRequest.isIPv4
        ? skipped<DnsResponse>('IP address provided, skipping DNS check.')
        : await dnsCheck.run(appRequest);

    const tcpResult = dnsResult.status === 'success' || dnsResult.status === 'skipped'
        ? await tcpCheck.run(appRequest)
        : skipped<TcpResponse>('DNS check failed, skipping TCP check.');

    const httpResult = tcpResult.status === 'success'
        ? await httpCheck.run(appRequest)
        : skipped<HttpResponse>('TCP check failed or was skipped, skipping HTTP check.');

    const sslResult = tcpResult.status === 'success' && appRequest.isHttps
        ? await sslCheck.run(appRequest)
        : skipped<SSLCertResponse>('TCP check failed or was skipped, or protocol is not HTTPS, skipping SSL certificate check.');

    return {
        dns: dnsResult,
        tcp: tcpResult,
        http: httpResult,
        ssl: sslResult,
    };
}
