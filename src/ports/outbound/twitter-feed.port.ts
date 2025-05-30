export interface TwitterFeedMessage {
    author: string;
    createdAt: Date;
    id: string;
    text: string;
    url: string;
}

export interface TwitterFeedPort {
    /**
     * Fetch the latest messages for a given username.
     * @param username The Twitter (or Nitter) username
     * @param limit The maximum number of messages to fetch
     */
    fetchLatestMessages(username: string, limit?: number): Promise<TwitterFeedMessage[]>;
} 