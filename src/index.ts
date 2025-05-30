import { Client, GatewayIntentBits } from 'discord.js';

import { runEventsAgent } from './agents/events-agent.js';

export const token = process.env.DISCORD_BOT_TOKEN;
export const channelName = 'space';

if (!token) {
    throw new Error("La variable d'environnement DISCORD_BOT_TOKEN est requise.");
}

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

function extractJson(text: unknown): unknown {
    // If already an object, return as is
    if (typeof text === 'object' && text !== null) return text;

    // If it's a string, try to extract JSON from code block
    if (typeof text === 'string') {
        // Remove code block if present
        const match = text.match(/```json\s*([\s\S]*?)```/i);
        const jsonString = match ? match[1] : text;
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            // Try eval as a last resort (not recommended for untrusted input)
            try {
                return eval('(' + jsonString + ')');
            } catch {
                return null;
            }
        }
    }
    return null;
}

function isAgentResponse(
    obj: unknown,
): obj is { action: string; content?: string; reason?: string } {
    if (typeof obj !== 'object' || obj === null) return false;
    if (!Object.prototype.hasOwnProperty.call(obj, 'action')) return false;
    const action = (obj as Record<string, unknown>).action;
    return typeof action === 'string';
}

client.once('ready', async () => {
    console.log(`Bot connecté en tant que ${client.user?.tag}`);
    const agentResponse = await runEventsAgent(
        'List the next upcoming space events with their date, location, and a short description. Format the output as a Markdown list with clear bullet points, bold event titles, and aligned date/location/description. Add spacing and visual cues for clarity. Ensure the message is concise and easy to read in Discord.',
    );

    const parsed = extractJson(agentResponse);
    if (!isAgentResponse(parsed)) {
        console.error('Agent response is not valid JSON:', agentResponse);
        return;
    }

    if (parsed.action === 'post') {
        client.guilds.cache.forEach(async (guild) => {
            const channel = guild.channels.cache.find(
                (ch) => ch.type === 0 && ch.name === channelName, // 0 = GuildText
            );
            if (channel && channel.isTextBased() && parsed.content) {
                await channel.send(parsed.content);
                console.log(`Résumé des événements envoyé sur #${channelName}`);
            }
        });
    } else if (parsed.action === 'noop') {
        console.log(parsed.reason);
    } else {
        console.error('Unknown agent action:', parsed);
    }
});

client.login(token);
