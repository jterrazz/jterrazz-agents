import { type SocialFeedMessage } from './social-feed.port.js';

export type XPort = {
    fetchLatestMessages: (params: {
        timeAgo: { hours: number };
        username: string;
    }) => Promise<SocialFeedMessage[]>;
};
