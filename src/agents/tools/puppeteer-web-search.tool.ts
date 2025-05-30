import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';
import { tool } from '@langchain/core/tools';

export function createPuppeteerWebSearchTool() {
    return tool(
        async (input: string) => {
            if (!input || typeof input !== 'string') {
                throw new Error('Input must be a URL or search query string.');
            }
            // If input looks like a URL, use it directly; otherwise, search Google
            let url = input;
            if (!/^https?:\/\//.test(input)) {
                url = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
            }
            const loader = new PuppeteerWebBaseLoader(url);
            const docs = await loader.load();
            // Return the first document's content and source
            if (docs.length > 0) {
                return JSON.stringify({
                    content: docs[0].pageContent,
                    source: docs[0].metadata?.source,
                });
            }
            return JSON.stringify({ content: '', source: url });
        },
        {
            description:
                'Loads a web page using Puppeteer and returns the page content. Input: a URL or search query string.',
            name: 'puppeteerWebSearch',
        },
    );
}
