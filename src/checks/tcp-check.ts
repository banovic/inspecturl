import net from 'node:net';
import { type AppRequest } from '../types/app-request.js';
import { type Result, success, failure } from '../types/result.js';
import { type TcpResponse } from '../types/responses/tcp-response.js';

export class TcpCheck {
    constructor(private readonly createTcpSocket: () => net.Socket) { }

    async run(req: AppRequest): Promise<Result<TcpResponse>> {
        try {
            const startTime = Date.now();
            await this.checkConnection(req);

            return success({
                responseTimeMs: Date.now() - startTime,
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            return failure(`TCP connectivity check failed: ${message}`);
        }
    }

    private checkConnection(req: AppRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            const socket = this.createTcpSocket();

            const cleanup = () => {
                socket.removeListener('error', onError);
                socket.removeListener('timeout', onTimeout);
                socket.removeListener('connect', onConnect);
                socket.destroy();
            };

            const onError = (err: Error) => {
                cleanup();
                reject(err);
            };

            const onTimeout = () => {
                cleanup();
                reject(new Error('Connection timed out'));
            };

            const onConnect = () => {
                cleanup();
                resolve();
            };

            socket.on('error', onError);
            socket.on('timeout', onTimeout);
            socket.on('connect', onConnect);
            socket.setTimeout(req.timeout);
            socket.connect(req.port, req.host);

        });
    }
}