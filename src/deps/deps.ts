import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';
import https from 'node:https';
import type { Deps } from '../types/deps.js';

/**
 * App deps.
 */
export const appDeps: Deps = {
    dnsResolve4: dns.resolve4,

    createNetSocket: (): net.Socket => new net.Socket(),

    createTlsSocket: (port: number, host: string, options: tls.ConnectionOptions): tls.TLSSocket => {
        return tls.connect(port, host, options);
    },

    createHttpClientRequest: (isHttps: boolean, options: http.RequestOptions): http.ClientRequest => {
        const httpModule = isHttps ? https : http;
        return httpModule.request(options);
    },
};
