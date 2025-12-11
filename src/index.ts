#!/usr/bin/env node
/**
 * DiffPilot MCP Server - TypeScript Implementation
 * 
 * A Model Context Protocol server that provides PR code review and
 * developer productivity tools.
 * 
 * Run with: npx diffpilot
 * 
 * Tools provided:
 * - get_diff: Get code changes as diff
 * - review_code: Review changes with AI tips
 * - create_pr_title: Create a PR title
 * - create_pr_body: Create PR description text
 * - create_commit_message: Create commit message
 * - find_secrets: Find leaked passwords or keys
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Import security helpers
import {
  checkRateLimit,
  sanitizeOutput,
  sanitizeErrorMessage,
  logSecurityEvent,
} from './security/security-helpers.js';

// Import PR review tools
import {
  getPrDiff,
  reviewPrChanges,
  generatePrTitle,
  generatePrDescription,
  type GetPrDiffParams,
  type ReviewPrChangesParams,
  type GeneratePrTitleParams,
  type GeneratePrDescriptionParams,
} from './tools/pr-review.js';

// Import developer tools
import {
  checkChanges,
  generateCommitMessage,
  scanSecrets,
  type GenerateCommitMessageParams,
  type ScanSecretsParams,
} from './tools/developer.js';

// ============================================================================
// Tool Definitions
// ============================================================================

const TOOLS: Tool[] = [
  // Local Changes Tool
  {
    name: 'check_changes',
    description: 'Review local staged/unstaged changes.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // PR Review Tools
  {
    name: 'get_diff',
    description: 'Get branch diff vs main.',
    inputSchema: {
      type: 'object',
      properties: {
        baseBranch: {
          type: 'string',
          description: "Base branch (e.g., 'main'). Auto-detected.",
        },
        featureBranch: {
          type: 'string',
          description: 'Feature branch. Defaults to current.',
        },
        remote: {
          type: 'string',
          description: "Git remote (default: 'origin').",
        },
      },
      required: [],
    },
  },
  {
    name: 'review_code',
    description: 'Review branch diff vs main.',
    inputSchema: {
      type: 'object',
      properties: {
        baseBranch: {
          type: 'string',
          description: "Base branch (e.g., 'main'). Auto-detected.",
        },
        focusAreas: {
          type: 'string',
          description: "Focus areas (e.g., 'security, performance').",
        },
      },
      required: [],
    },
  },
  {
    name: 'create_pr_title',
    description: 'Create a PR title.',
    inputSchema: {
      type: 'object',
      properties: {
        baseBranch: {
          type: 'string',
          description: "Base branch (e.g., 'main'). Auto-detected.",
        },
        style: {
          type: 'string',
          enum: ['conventional', 'descriptive', 'ticket'],
          description: "Style: 'conventional', 'descriptive', or 'ticket'.",
        },
      },
      required: [],
    },
  },
  {
    name: 'create_pr_body',
    description: 'Create PR description text.',
    inputSchema: {
      type: 'object',
      properties: {
        baseBranch: {
          type: 'string',
          description: "Base branch (e.g., 'main'). Auto-detected.",
        },
        includeChecklist: {
          type: 'boolean',
          description: 'Include PR checklist (default: true).',
        },
        ticketUrl: {
          type: 'string',
          description: 'Ticket/issue URL to include.',
        },
      },
      required: [],
    },
  },

  // Developer Tools
  {
    name: 'create_commit_message',
    description: 'Create commit message.',
    inputSchema: {
      type: 'object',
      properties: {
        style: {
          type: 'string',
          enum: ['conventional', 'simple'],
          description: "Style: 'conventional' or 'simple'.",
        },
        scope: {
          type: 'string',
          description: "Scope (e.g., 'api', 'ui', 'auth').",
        },
        includeBody: {
          type: 'boolean',
          description: 'Include body section (default: true).',
        },
      },
      required: [],
    },
  },
  {
    name: 'find_secrets',
    description: 'Find leaked passwords or keys.',
    inputSchema: {
      type: 'object',
      properties: {
        scanStaged: {
          type: 'boolean',
          description: 'Scan staged changes (default: true).',
        },
        scanUnstaged: {
          type: 'boolean',
          description: 'Scan unstaged changes (default: true).',
        },
      },
      required: [],
    },
  },
];

// ============================================================================
// Server Setup
// ============================================================================

/**
 * Creates and configures the MCP server.
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'diffpilot',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Register tool execution handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Security: Validate tool name format (CWE-20: Input Validation)
    if (!name || name.length > 50 || !/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(name)) {
      logSecurityEvent('INVALID_TOOL_NAME', `Rejected tool name: ${name?.slice(0, 50)}`);
      return {
        content: [{ type: 'text', text: 'Invalid tool name format.' }],
        isError: true,
      };
    }

    // Security: Rate limiting per tool (CWE-400: DoS Prevention)
    if (!checkRateLimit(name)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', `Tool: ${name}`);
      return {
        content: [{ type: 'text', text: 'Rate limit exceeded. Please wait before retrying.' }],
        isError: true,
      };
    }

    try {
      let result;
      switch (name) {
        // Local Changes Tool
        case 'check_changes':
          result = await checkChanges();
          break;

        // PR Review Tools
        case 'get_diff':
          result = await getPrDiff(args as GetPrDiffParams);
          break;

        case 'review_code':
          result = await reviewPrChanges(args as ReviewPrChangesParams);
          break;

        case 'create_pr_title':
          result = await generatePrTitle(args as GeneratePrTitleParams);
          break;

        case 'create_pr_body':
          result = await generatePrDescription(args as GeneratePrDescriptionParams);
          break;

        // Developer Tools
        case 'create_commit_message':
          result = await generateCommitMessage(args as GenerateCommitMessageParams);
          break;

        case 'find_secrets':
          result = await scanSecrets(args as ScanSecretsParams);
          break;

        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }

      // Security: Sanitize output to prevent sensitive data exposure (CWE-200)
      if (result && result.content) {
        result.content = result.content.map((item) => {
          if (item.type === 'text' && typeof item.text === 'string') {
            return { ...item, text: sanitizeOutput(item.text) };
          }
          return item;
        });
      }

      return result;
    } catch (err) {
      // Security: Sanitize error messages (CWE-200: Information Disclosure)
      const rawMessage = err instanceof Error ? err.message : String(err);
      const safeMessage = sanitizeErrorMessage(rawMessage);
      logSecurityEvent('TOOL_ERROR', `Tool '${name}' failed`);
      return {
        content: [{ type: 'text', text: `Error: ${safeMessage}` }],
        isError: true,
      };
    }
  });

  return server;
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  // Log startup to stderr (not stdout - that's for JSON-RPC)
  console.error('DiffPilot MCP Server starting...');
  console.error(`Tools available: ${TOOLS.length}`);

  await server.connect(transport);

  console.error('DiffPilot MCP Server running on stdio');
}

// Run the server
main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
