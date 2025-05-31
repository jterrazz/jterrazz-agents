export interface SocialFeedMessage {
    author: string;
    createdAt: Date;
    id: string;
    text: string;
    timeAgo: string; // Human-readable time difference from now
    url: string;
}

export interface SocialFeedPort {
    fetchLatestMessages(username: string, limit?: number): Promise<SocialFeedMessage[]>;
}
