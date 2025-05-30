import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

const webSearch = new TavilySearchResults();

export async function searchWeb(query: string): Promise<string[]> {
    const results = await webSearch.invoke({ query });
    return Array.isArray(results) ? results : [String(results)];
}
