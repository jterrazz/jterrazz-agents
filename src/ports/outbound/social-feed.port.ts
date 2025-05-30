export interface SocialFeedMessage {
    author: string;
    createdAt: Date;
    id: string;
    text: string;
    url: string;
}

export interface SocialFeedPort {
    fetchLatestMessages(username: string, limit?: number): Promise<SocialFeedMessage[]>;
}
