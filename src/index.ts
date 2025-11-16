import { type AppRequest, createAppRequestFromString } from './types/app-request.js';
import { appDeps } from './deps/deps.js';
import { checkHealth } from './health-check.js';
import type { HealthReport } from './types/health-report.js';

function printHelp(): void {
    console.log('Usage: node dist/index.js <URL>');
    console.log('Example: node dist/index.js https://example.com');
}

function hasErrors(report: HealthReport): boolean {
    return report.dns.status === 'error' ||
        report.tcp.status === 'error' ||
        report.http.status === 'error' ||
        report.ssl.status === 'error';
}

async function main(): Promise<void> {
    const input = process.argv[2] || undefined;
    if (!input) {
        printHelp();
        process.exit(1);
    }

    if (input === '--help' || input === '-h') {
        printHelp();
        process.exit(0);
    }

    const appRequest: AppRequest | undefined = createAppRequestFromString(input);
    if (!appRequest) {
        printHelp();
        process.exit(1);
    }

    try {
        const report = await checkHealth(appRequest, appDeps);
        console.log('Health Report:', report);
        if (hasErrors(report)) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error(`Health check failed: ${message}`);
        process.exit(1);
    }
}

main();