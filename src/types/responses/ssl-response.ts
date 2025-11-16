export interface SSLCertResponse {
    validFrom: string;
    validTo: string;
    issuer: string;
    subject: string;
    isExpired: boolean;
    isValidYet: boolean;
    doesHostMatch: boolean;
    responseTimeMs: number;
}