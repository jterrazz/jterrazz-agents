
export interface AgentPort {
    run(userQuery: string, channelName: string): Promise<void>;
}
