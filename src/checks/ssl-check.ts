import tls from 'node:tls';
import { type Result, success, failure } from '../types/result.js';
import { type SSLCertResponse } from '../types/responses/ssl-response.js';
import type { AppRequest } from '../types/app-request.js';

export class SslCheck {
    constructor(
        private readonly createTlsSocket: (port: number, host: string, options: tls.ConnectionOptions) => tls.TLSSocket
    ) { }

    async run(req: AppRequest): Promise<Result<SSLCertResponse>> {
        try {
            const startTime = Date.now();
            const cert = await this.checkConnection(req);
            const now = new Date();

            return success({
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                issuer: cert.issuer?.CN || JSON.stringify(cert.issuer) || '',
                subject: cert.subject?.CN || JSON.stringify(cert.subject) || '',
                responseTimeMs: Date.now() - startTime,

                isExpired: cert.valid_to ? new Date(cert.valid_to) < now : false,
                isValidYet: cert.valid_from ? new Date(cert.valid_from) <= now : false,
                doesHostMatch: tls.checkServerIdentity(req.host, cert) === undefined,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return failure(`SSL certificate check failed: ${message}`);
        }
    }

    private checkConnection(req: AppRequest): Promise<tls.PeerCertificate> {
        return new Promise<tls.PeerCertificate>((resolve, reject) => {
            const socket = this.createTlsSocket(req.port, req.host, { servername: req.host, timeout: req.timeout });

            const cleanup = () => {
                socket.removeAllListeners('secureConnect');
                socket.removeAllListeners('error');
                socket.removeAllListeners('timeout');
                socket.destroy();
            };

            const onSecureConnect = () => {
                const cert = socket.getPeerCertificate();
                cleanup();
                resolve(cert);
            };

            const onError = (err: Error) => {
                cleanup();
                reject(err);
            };

            const onTimeout = () => {
                cleanup();
                reject(new Error(`Connection timed out`));
            };

            socket.on('secureConnect', onSecureConnect);
            socket.on('error', onError);
            socket.on('timeout', onTimeout);
        });
    }
}
