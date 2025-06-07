export interface FetchLatestPostsParams {
    limit?: number;
    timeAgo?: { hours: number };
    username: string;
}

export type XPort = {
    fetchLatestMessages: (params: FetchLatestPostsParams) => Promise<XPostPort[]>;
};

export interface XPostPort {
    author: string;
    createdAt: Date;
    id: string;
    text: string;
    timeAgo: string; // Human-readable time difference from now
    url: string;
    username: string;
}
