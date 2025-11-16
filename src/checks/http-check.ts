import http from 'node:http';
import { type Result, success, failure } from '../types/result.js';
import { type HttpResponse } from '../types/responses/http-response.js';
import type { AppRequest } from '../types/app-request.js';

export class HttpCheck {
    constructor(
        private readonly createClientRequest: (isHttps: boolean, options: http.RequestOptions) => http.ClientRequest
    ) { }

    async run(req: AppRequest): Promise<Result<HttpResponse>> {
        try {
            const startTime = Date.now();
            const statusCode = await this.checkConnection(req);
            const responseTimeMs = Date.now() - startTime;
            return success({
                statusCode,
                responseTimeMs,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return failure(`HTTP check failed: ${message}`);
        }
    }

    private checkConnection(req: AppRequest): Promise<number> {
        return new Promise((resolve, reject) => {
            const options = {
                host: req.host,
                method: req.method,
                timeout: req.timeout,
                port: req.port,
                path: `${req.path}${req.search}`,
                headers: {
                    'User-Agent': req.userAgent,
                }
            };
            const request = this.createClientRequest(req.isHttps, options);

            const cleanup = () => {
                request.removeAllListeners('response');
                request.removeAllListeners('error');
                request.removeAllListeners('timeout');
                request.destroy();
            };

            const onResponse = (response: http.IncomingMessage) => {
                response.resume(); // Consume response data to free up memory
                cleanup();
                if (response.statusCode === undefined || response.statusCode === null) {
                    reject(new Error(`No status code received`));
                } else {
                    resolve(response.statusCode);
                }
            };

            const onError = (err: Error) => {
                cleanup();
                reject(err);
            };

            const onTimeout = () => {
                cleanup();
                reject(new Error(`Request timed out`));
            };

            request.on('response', onResponse);
            request.on('error', onError);
            request.on('timeout', onTimeout);

            request.end();
        });
    }
}
