import net from 'node:net';
import tls from 'node:tls';
import http from 'node:http';

export interface Deps {
    dnsResolve4: (domain: string) => Promise<string[]>;
    createNetSocket: () => net.Socket;
    createTlsSocket: (port: number, host: string, options: tls.ConnectionOptions) => tls.TLSSocket;
    createHttpClientRequest: (isHttps: boolean, options: http.RequestOptions) => http.ClientRequest;
}