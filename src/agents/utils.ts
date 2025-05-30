export function extractJson(text: unknown): unknown {
    if (typeof text === 'object' && text !== null) return text;
    if (typeof text === 'string') {
        const match = text.match(/```json\s*([\s\S]*?)```/i);
        const jsonString = match ? match[1] : text;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            try {
                return eval('(' + jsonString + ')');
            } catch {
                return null;
            }
        }
    }
    return null;
}

export function isAgentResponse(
    obj: unknown,
): obj is { action: string; content?: string; reason?: string } {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!Object.prototype.hasOwnProperty.call(obj, 'action')) return false;
    const action = (obj as Record<string, unknown>).action;
    return typeof action === 'string';
}
