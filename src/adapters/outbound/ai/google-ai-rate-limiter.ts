// Google AI Free Tier: 10 requests per minute, 500 per day
// Simple in-memory rate limiter for outbound Google AI API calls

const REQUESTS_PER_MINUTE = 10;
const REQUESTS_PER_DAY = 500;

let minuteTimestamps: number[] = [];
let dayTimestamps: number[] = [];

export async function withGoogleAIRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    pruneOldTimestamps();
    if (minuteTimestamps.length >= REQUESTS_PER_MINUTE) {
        const wait = 60_000 - (now() - minuteTimestamps[0]);
        await new Promise((res) => setTimeout(res, wait));
        return withGoogleAIRateLimit(fn); // Recurse after wait
    }
    if (dayTimestamps.length >= REQUESTS_PER_DAY) {
        const wait = 24 * 60 * 60 * 1000 - (now() - dayTimestamps[0]);
        throw new Error(
            `Google AI daily rate limit reached. Try again in ${Math.ceil(wait / 1000 / 60)} minutes.`,
        );
    }
    minuteTimestamps.push(now());
    dayTimestamps.push(now());
    return fn();
}

function now() {
    return Date.now();
}

function pruneOldTimestamps() {
    const oneMinuteAgo = now() - 60_000;
    const oneDayAgo = now() - 24 * 60 * 60 * 1000;
    minuteTimestamps = minuteTimestamps.filter((ts) => ts > oneMinuteAgo);
    dayTimestamps = dayTimestamps.filter((ts) => ts > oneDayAgo);
}
