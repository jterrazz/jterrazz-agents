# jterrazz-agents

A production-ready framework for building and deploying autonomous AI agents to automate Discord server management and content curation, built with TypeScript and a clean architecture.

## Core Concepts

This project is designed to be a scalable and maintainable foundation for creating AI agents. The key architectural ideas are:

- **Agents**: Specialized AI entities responsible for specific tasks, like curating news or announcing events. They are built using LangChain and can be equipped with various tools.
- **Tasks**: Scheduled jobs that trigger agents to run. The framework uses a cron-based scheduler to run tasks at specified intervals.
- **Ports & Adapters (Clean Architecture)**: The project strictly separates domain logic from infrastructure details. This makes it easy to swap out external services (e.g., changing the AI model provider or Discord library) without affecting the core application logic.

The directory structure reflects this architecture:

```
src/
├── ports/                # Domain interfaces (the "what")
├── adapters/             # Infrastructure implementations (the "how")
├── di/                   # Dependency injection container
└── index.ts              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 22+
- Discord Bot Token
- Google AI API Key (or other LLM provider)
- Apify Token (for web scraping tools)

### Installation & Setup

1.  **Clone and install dependencies:**

    ```bash
    git clone https://github.com/jterrazz/jterrazz-agents
    cd jterrazz-agents
    npm install
    ```

2.  **Configure credentials:**

    Create a `config/local.yml` file with your credentials:

    ```yaml
    outbound:
      google:
        apiKey: 'your-google-ai-api-key'
      discord:
        botToken: 'your-discord-bot-token'
      apify:
        token: 'your-apify-token'
    ```

3.  **Run the application:**

    ```bash
    # Development mode with live reload
    npm run dev

    # Production mode
    npm run build
    npm start
    ```

## Usage & Customization

The framework is designed for extension. Here are common use cases:

### Creating a Custom Task

To create a new scheduled task, define a task file in `src/adapters/inbound/executor/tasks/`:

```typescript
// src/adapters/inbound/executor/tasks/my-custom.task.ts
import { type TaskPort } from '../../../../ports/inbound/executor.port.js';
import { type AgentPort } from '../../../../ports/outbound/agents.port.js';

export function createCustomTask({ agent }: { agent: AgentPort }): TaskPort {
  return {
    execute: () => agent.run(''),
    executeOnStartup: false,
    name: 'CustomTask',
    schedule: '0 18 * * 5', // Every Friday at 6:00 PM UTC
  };
}
```

Then, wire it up in the dependency injection container.

### Custom Agent Implementation

You can create new agents with custom personalities, tools, and prompts.

```typescript
// src/adapters/outbound/agents/my-custom.agent.ts
import { ChatAgent, type ChatAgentDependencies } from './base/chat-agent.js';

export class CustomNewsAgent extends ChatAgent {
  constructor(dependencies: ChatAgentDependencies) {
    super(dependencies, 'CustomNewsAgent', [
      /*...prompts...*/
    ]);
  }

  async run(_userQuery: string): Promise<void> {
    // ... custom logic ...
  }
}
```

### Adding New Tools

Agents can be extended with new tools to interact with different APIs or data sources.

```typescript
// src/adapters/outbound/agents/tools/my-custom.tool.ts
import { createSafeAgentTool } from './tool.js';

export function createCustomTool(logger: LoggerPort): AgentToolPort {
  return createSafeAgentTool(
    {
      name: 'customTool',
      description: 'A description of what this tool does.',
    },
    async () => {
      // ... tool logic ...
      return 'Result of the tool';
    },
    logger,
  );
}
```

## Development

- **Run tests:** `npm test`
- **Lint code:** `npm run lint`

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

---

_Built with ❤️ using TypeScript, LangChain, and clean architecture principles._
