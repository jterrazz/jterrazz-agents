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
    url: string;
    username: string;
}
