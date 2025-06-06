export interface FetchLatestMessagesParams {
    limit?: number;
    timeAgo?: { hours: number };
    username: string;
}

export interface SocialFeedMessage {
    author: string;
    createdAt: Date;
    id: string;
    text: string;
    timeAgo: string; // Human-readable time difference from now
    url: string;
}

export interface SocialFeedPort {
    fetchLatestMessages(params: FetchLatestMessagesParams): Promise<SocialFeedMessage[]>;
}
