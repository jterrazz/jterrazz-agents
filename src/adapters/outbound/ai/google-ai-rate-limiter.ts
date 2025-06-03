// Google AI Free Tier: 10 requests per minute, 500 per day
// Simple in-memory rate limiter for outbound Google AI API calls

const REQUESTS_PER_MINUTE = 10;

let minuteTimestamps: number[] = [];

export async function withGoogleAIRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    pruneOldTimestamps();
    if (minuteTimestamps.length >= REQUESTS_PER_MINUTE) {
        const wait = 60_000 - (now() - minuteTimestamps[0]);
        await new Promise((res) => setTimeout(res, wait));
        return withGoogleAIRateLimit(fn); // Recurse after wait
    }
    minuteTimestamps.push(now());
    return fn();
}

function now() {
    return Date.now();
}

function pruneOldTimestamps() {
    const oneMinuteAgo = now() - 60_000;
    minuteTimestamps = minuteTimestamps.filter((ts) => ts > oneMinuteAgo);
}
