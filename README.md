# jterrazz-agents

This repository manages intelligent agents for automating tasks on your Discord server and in your personal life.

## Overview

- **Goal:** Provide a modular framework for running AI-powered agents that interact with Discord and automate personal workflows.
- **Features:**
  - Discord bot integration (via `discord.js`)
  - Automated news and event summarization (AI, dev, crypto, finance, tech, and space)
  - Web scraping and search tools (using Puppeteer and Cheerio)
  - Extensible agent and tool system
  - Job scheduling for regular updates

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure your credentials:**

   - Edit `config/local.yml` to provide your configuration values. Example:
     ```yaml
     outbound:
       google:
         apiKey: <your-google-api-key>
       discord:
         botToken: <your-discord-bot-token>
     ```

3. **Run the bot in development:**

   ```bash
   npm run dev
   ```

   - For production, use:
     ```bash
     npm run build
     npm start
     ```

## Usage

- The bot connects to your Discord server and posts updates (e.g., news, events) in the configured channel.
- Agents are modular and can be extended to automate more aspects of your Discord or personal workflows.
- Job runners automatically schedule and execute agent tasks (e.g., daily news, event reminders).

## Project Structure

- `src/agents/` — Agent definitions (AI, dev, crypto, finance, tech, space) and their tools
- `src/ports/` — Domain interfaces (ports) for application boundaries
- `src/adapters/` — Infrastructure implementations (Discord, web scraping, AI, configuration, job runner)
- `src/di/` — Dependency injection setup
- `config/` — Configuration files (use `local.yml` for local secrets/keys)

## Agents & Tools

- **Agents:** Each agent (e.g., AI news, dev news, crypto news, financial news, tech events, space events) is responsible for fetching, filtering, and posting relevant content.
- **Tools:** Modular tools fetch tweets, events, and perform web searches. Each tool is reusable and can be composed into agents.
- **Job Runner:** Schedules and triggers agents at defined intervals (e.g., every morning).

## Configuration

- All configuration is managed via YAML files in the `config/` directory.
- The main keys you need to set are:
  - `outbound.google.apiKey`
  - `outbound.discord.botToken`

## Contributing

Contributions are welcome! If you have ideas, improvements, or want to help build the next big thing, check out the repository:

https://github.com/jterrazz/jterrazz-agents

Feel free to open issues or submit pull requests.
