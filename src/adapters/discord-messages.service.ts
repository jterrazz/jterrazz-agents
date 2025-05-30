import { type Client } from 'discord.js';

export async function getRecentBotMessages({
  channelName,
  client,
  limit = 10,
}: {
  channelName: string;
  client: Client;
  limit?: number;
}): Promise<string[]> {
  const guild = client.guilds.cache.first();
  if (!guild) return [];
  const channel = guild.channels.cache.find(
    (ch) => ch.type === 0 && ch.name === channelName
  );
  if (!channel || !channel.isTextBased()) return [];
  const messages = await channel.messages.fetch({ limit });
  return messages
    .filter((msg) => msg.author.id === client.user?.id)
    .map((msg) => msg.content);
} 