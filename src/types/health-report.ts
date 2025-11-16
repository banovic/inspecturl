import { type Result } from './result.js';
import { type DnsResponse } from './responses/dns-response.js';
import { type TcpResponse } from './responses/tcp-response.js';
import { type HttpResponse } from './responses/http-response.js';
import { type SSLCertResponse } from './responses/ssl-response.js';

export interface HealthReport {
    dns: Result<DnsResponse>;
    tcp: Result<TcpResponse>;
    http: Result<HttpResponse>;
    ssl: Result<SSLCertResponse>;
}
