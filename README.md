# jterrazz-agents

A production-ready AI agent framework for automating Discord server management and content curation using LangChain, TypeScript, and clean architecture principles.

## Overview

This project provides a robust, scalable framework for building and deploying intelligent agents that automate Discord interactions and content curation workflows. Built with clean architecture, comprehensive logging, and production-ready patterns.

### Key Features

- **🤖 Multi-Agent System**: 6 specialized agents for different content domains
- **📅 Automated Scheduling**: Cron-based job scheduling with configurable intervals
- **🔄 Robust Architecture**: Clean architecture with ports & adapters pattern
- **📊 Comprehensive Logging**: Structured logging with Pino for production monitoring
- **🛡️ Type Safety**: Full TypeScript implementation with strict typing
- **🔌 Extensible Design**: Modular tools and formatters for easy extension
- **⚡ Production Ready**: Graceful shutdown, retry logic, and error handling
- **🧪 Well Tested**: Comprehensive test suite with proper mocking

## Agent Types

### News Agents

- **AI News Agent**: Curates AI and machine learning content
- **Crypto News Agent**: Tracks cryptocurrency and blockchain updates
- **Development News Agent**: Aggregates software development and programming content
- **Finance News Agent**: Monitors financial markets and economic updates

### Event Agents

- **Space Events Agent**: Tracks space exploration and aerospace events
- **Technology Events Agent**: Curates tech conferences and industry events (Apple, Microsoft, Google, Meta, CES, Amazon)

## Architecture

### Clean Architecture Implementation

```
src/
├── ports/                # Domain interfaces
│   ├── inbound/          # Application entry points
│   └── outbound/         # External service contracts
├── adapters/             # Infrastructure implementations
│   ├── inbound/          # External triggers (jobs, configuration)
│   └── outbound/         # External services (Discord, AI, web)
├── di/                   # Dependency injection container
└── index.ts              # Application entry point
```

### Core Components

#### Agents (`src/adapters/outbound/agents/`)

- Built on LangChain's StructuredChatAgent
- JSON-schema based response validation
- Configurable prompts (role, tone, format, language)
- Intelligent tool selection and execution

#### Tools (`src/adapters/outbound/agents/tools/`)

- **Data Fetching**: X posts, Discord messages, events
- **Formatters**: Consistent data presentation with time-ago calculations
- **Utilities**: Date handling, filtering, and data processing

#### Job Scheduling (`src/adapters/inbound/job-runner/`)

- Cron-based scheduling with node-cron
- Configurable execution intervals
- Graceful error handling and logging

### Technology Stack

- **Runtime**: Node.js with ES modules
- **Language**: TypeScript with strict configuration
- **AI Framework**: LangChain with Google AI (Gemini)
- **Discord**: discord.js with robust connection handling
- **Logging**: Pino with structured JSON output
- **Testing**: Vitest with comprehensive mocking
- **Dependency Injection**: @snap/ts-inject
- **Configuration**: YAML-based with environment overrides

## Setup & Installation

### Prerequisites

- Node.js 22+
- Discord Bot Token
- Google AI API Key
- Apify Token

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/jterrazz/jterrazz-agents
   cd jterrazz-agents
   npm install
   ```

2. **Configure credentials:**

   Create `config/local.yml`:

   ```yaml
   outbound:
     google:
       apiKey: 'your-google-ai-api-key'
     discord:
       botToken: 'your-discord-bot-token'
     apify:
       token: 'your-apify-token'
   ```

3. **Run in development:**

   ```bash
   npm run dev
   ```

4. **Production deployment:**
   ```bash
   npm run build
   npm start
   ```

## Configuration

### Scheduling Configuration

All agents run on a unified schedule:

- **Schedule**: Monday & Thursday at 4:00 PM (UTC)
- **Cron Expression**: `'0 16 * * 1,4'`
- **Configurable per job** in `src/adapters/inbound/job-runner/jobs/`

### Agent Configuration

Each agent can be customized with:

- **Role**: Contributor, curator, etc.
- **Tone**: Fun, professional, casual
- **Format**: Discord news, Discord events
- **Language**: French (configurable)

## Usage Examples

### Manual Agent Execution

```typescript
import { createContainer } from './di/container.js';

const container = createContainer();
const aiNewsAgent = container.get('AINewsAgent');

// Run agent manually
await aiNewsAgent.run('Find the most important AI news from the past 24 hours');
```

### Adding New Tools

```typescript
export function createCustomTool(dependencies: ToolDependencies) {
  return new DynamicTool({
    name: 'customTool',
    description: 'Description for the AI agent',
    func: async (input: string) => {
      // Tool implementation
      return formatResult(result);
    },
  });
}
```

### Custom Agent Implementation

```typescript
export class CustomAgent extends ChatAgent {
  constructor(dependencies: ChatAgentDependencies) {
    super(dependencies, 'CustomAgent', 'You are a specialized agent that...', [
      useRole().contributor,
      useTone().professional,
    ]);
  }

  protected getTools(): AgentTool[] {
    return [this.tools.customTool, this.tools.getCurrentDate];
  }
}
```

## Development

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test filename.test.ts
```

### Code Quality

```bash
# Linting
npm run lint
```

### Debugging

```bash
npm run dev
```

## Production Deployment

### Environment Variables

```bash
NODE_ENV=production
DISCORD_BOT_TOKEN=your_token
GOOGLE_API_KEY=your_key
APIFY_TOKEN=your_token
```

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow TypeScript best practices** and existing patterns
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Submit a pull request**

## Repository

🔗 **GitHub**: [https://github.com/jterrazz/jterrazz-agents](https://github.com/jterrazz/jterrazz-agents)

---

_Built with ❤️ using TypeScript, LangChain, and clean architecture principles._
