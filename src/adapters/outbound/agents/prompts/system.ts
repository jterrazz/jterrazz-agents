export function buildSystemPrompt(
    genericRole: string,
    agentSpecificRole: string,
    ...sections: string[]
) {
    return [
        'GENERIC ROLE:' + genericRole,
        'AGENT SPECIFIC ROLE:' + agentSpecificRole,
        ...sections,
    ].join('\n ===\n');
}
