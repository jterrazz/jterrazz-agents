# jterrazz-agents

This repository manages intelligent agents for automating tasks on your Discord server and in your personal life.

## Overview

- **Goal:** Provide a framework for running AI-powered agents that interact with Discord and automate personal workflows.
- **Features:**
  - Discord bot integration
  - Event summarization and posting
  - Web search and event fetching tools
  - Extensible agent and tool system

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   - Create a `.env` file or set the following variables:
     - `GOOGLE_API_KEY` (your Google Cloud API key)
     - `DISCORD_BOT_TOKEN` (your Discord bot token)
     - `TAVILY_API_KEY` (for web search, if used)
3. **Run the bot in development:**
   ```bash
   npm run dev
   ```

## Usage

- The bot will connect to your Discord server and post updates (e.g., upcoming space events) in the configured channel.
- Agents can be extended to automate more aspects of your Discord or personal workflows.

## Project Structure

- `src/agents/` — Agent definitions and logic
- `src/ports/` — Port interfaces and contracts (application boundaries)
- `src/adapters/` — Adapter implementations (Discord, web search, events, etc.)

---

Feel free to extend this project to add more agents and automation for your Discord and daily life!

## Contributing

Contributions are welcome! If you have ideas, improvements, or want to help build the next big thing, check out the repository:

https://github.com/jterrazz/jterrazz-agents

Feel free to open issues or submit pull requests.
 