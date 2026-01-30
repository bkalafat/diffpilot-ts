/**
 * PR Review Tools - Implementation of PR review tools for the MCP server.
 * 
 * These tools help developers with code review workflows:
 * - get_pr_diff: Raw diff for any purpose
 * - review_pr_changes: Diff with AI review instructions
 * - generate_pr_title: Conventional PR title generation
 * - generate_pr_description: Complete PR description with summary and checklist
 * 
 * Ported from: src/Tools/PrReviewTools.cs
 */

import {
  runGitCommand,
  getCurrentBranch,
  findBaseBranch,
  isValidBranchName,
  getWorkingDirectory,
  isDefaultBranch,
  getUnpushedCommitCount,
  type BranchInfo,
} from '../git/git-service.js';
import { success, error, gitError, truncateContent, type ToolResult } from './types.js';

/** Parameters for branch-based operations */
interface BranchParams {
  baseBranch?: string;
  featureBranch?: string;
  remote?: string;
}

/** Extracted branch parameters with validation */
interface ExtractedBranches {
  baseBranch: string;
  featureBranch: string;
  remote: string;
  isOnDefaultBranch?: boolean;
  error?: ToolResult;
}

/**
 * Extracts and validates branch parameters from arguments.
 * Auto-detects branches if not provided.
 */
async function extractBranchParameters(
  args: BranchParams | undefined,
  repoDir: string
): Promise<ExtractedBranches> {
  let remote = args?.remote ?? 'origin';
  let baseBranch = args?.baseBranch;
  let featureBranch = args?.featureBranch;

  // Auto-detect feature branch if not provided
  if (!featureBranch) {
    featureBranch = (await getCurrentBranch(repoDir)) ?? undefined;
    if (!featureBranch) {
      return {
        baseBranch: '',
        featureBranch: '',
        remote,
        error: gitError(
          'Failed to detect current branch',
          'Could not determine current branch. You may be in a detached HEAD state.'
        ),
      };
    }
  }

  // Auto-detect base branch if not provided
  if (!baseBranch) {
    // Check if we're on the default branch (main/master/develop)
    const onDefaultBranch = await isDefaultBranch(repoDir, featureBranch, remote);
    
    if (onDefaultBranch) {
      // User is on main - check for unpushed commits to compare against remote
      const unpushedCount = await getUnpushedCommitCount(repoDir, featureBranch, remote);
      
      if (unpushedCount > 0) {
        // Compare local main to remote main (unpushed commits)
        return {
          baseBranch: featureBranch, // Will use origin/main...main
          featureBranch,
          remote,
          isOnDefaultBranch: true,
        };
      } else {
        return {
          baseBranch: '',
          featureBranch: '',
          remote,
          error: error(
            `You are on the '${featureBranch}' branch with no unpushed commits. ` +
              'Either:\n' +
              '  1. Create a feature branch: `git checkout -b feature/my-feature`\n' +
              '  2. Make and stage changes to review with `check_changes`\n' +
              "  3. Specify a 'baseBranch' to compare against a different branch"
          ),
        };
      }
    }
    
    const baseInfo = await findBaseBranch(repoDir, featureBranch, remote);
    if (baseInfo) {
      remote = baseInfo.remote;
      baseBranch = baseInfo.baseBranch;
    } else {
      return {
        baseBranch: '',
        featureBranch: '',
        remote,
        error: error(
          `Could not automatically determine the base branch for '${featureBranch}'. ` +
            "Please specify the 'baseBranch' parameter (e.g., 'main' or 'develop')."
        ),
      };
    }
  }

  // Validate branch names
  if (!isValidBranchName(remote)) {
    return {
      baseBranch: '',
      featureBranch: '',
      remote,
      error: error('Remote name contains invalid characters.'),
    };
  }

  if (!isValidBranchName(baseBranch)) {
    return {
      baseBranch: '',
      featureBranch: '',
      remote,
      error: error('Base branch name contains invalid characters.'),
    };
  }

  if (!isValidBranchName(featureBranch)) {
    return {
      baseBranch: '',
      featureBranch: '',
      remote,
      error: error('Feature branch name contains invalid characters.'),
    };
  }

  return { baseBranch, featureBranch, remote, isOnDefaultBranch: false };
}

/**
 * Gets the diff between base and feature branches.
 * When isOnDefaultBranch is true, compares local branch to its remote tracking branch.
 */
async function getDiff(
  repoDir: string,
  remote: string,
  baseBranch: string,
  featureBranch: string,
  isOnDefaultBranch: boolean = false
): Promise<{ diff?: string; error?: ToolResult }> {
  // When on default branch, compare local to remote (unpushed commits)
  // Use '..' for linear comparison instead of '...' for merge-base comparison
  const diffArgs = isOnDefaultBranch
    ? `diff ${remote}/${featureBranch}..${featureBranch}`
    : `diff ${remote}/${baseBranch}...${featureBranch}`;
  const diffResult = await runGitCommand(diffArgs, repoDir);

  if (diffResult.exitCode !== 0) {
    return { error: gitError('git diff failed', diffResult.output) };
  }

  if (!diffResult.output.trim()) {
    return { diff: 'No changes found between branches.' };
  }

  return { diff: diffResult.output };
}

// ============================================================================
// Tool: get_pr_diff
// ============================================================================

/** Parameters for get_pr_diff tool */
export interface GetPrDiffParams extends BranchParams {}

/**
 * Gets the raw diff between base branch and current/feature branch.
 * Auto-detects branches if not specified.
 */
export async function getPrDiff(args?: GetPrDiffParams): Promise<ToolResult> {
  const repoDir = getWorkingDirectory();

  // Extract and validate parameters
  const branches = await extractBranchParameters(args, repoDir);
  if (branches.error) {
    return branches.error;
  }

  const { baseBranch, featureBranch, remote, isOnDefaultBranch } = branches;

  // Fetch latest
  const fetchResult = await runGitCommand(`fetch ${remote}`, repoDir);
  if (fetchResult.exitCode !== 0) {
    return gitError('git fetch failed', fetchResult.output);
  }

  // Generate diff
  const diffResult = await getDiff(repoDir, remote, baseBranch, featureBranch, isOnDefaultBranch);
  if (diffResult.error) {
    return diffResult.error;
  }

  // Return diff content
  const header = isOnDefaultBranch
    ? `## Diff: Unpushed commits on \`${featureBranch}\`\n\n` +
      `Comparing \`${remote}/${featureBranch}..${featureBranch}\` (local vs remote)\n\n`
    : `## Diff: ${remote}/${baseBranch} → ${featureBranch}\n\n` +
      `Comparing \`${remote}/${baseBranch}...${featureBranch}\`\n\n`;

  const diffContent = truncateContent(diffResult.diff!);

  return success(header + '```diff\n' + diffContent + '\n```');
}

// ============================================================================
// Tool: review_pr_changes
// ============================================================================

/** Parameters for review_pr_changes tool */
export interface ReviewPrChangesParams extends BranchParams {
  focusAreas?: string;
}

/**
 * Gets the PR diff with instructions for AI code review.
 * Provides structured context to help AI perform a thorough review.
 */
export async function reviewPrChanges(args?: ReviewPrChangesParams): Promise<ToolResult> {
  const repoDir = getWorkingDirectory();

  // Extract and validate parameters
  const branches = await extractBranchParameters(args, repoDir);
  if (branches.error) {
    return branches.error;
  }

  const { baseBranch, featureBranch, remote, isOnDefaultBranch } = branches;
  const focusAreas = args?.focusAreas;

  // Fetch latest
  const fetchResult = await runGitCommand(`fetch ${remote}`, repoDir);
  if (fetchResult.exitCode !== 0) {
    return gitError('git fetch failed', fetchResult.output);
  }

  // Generate diff
  const diffResult = await getDiff(repoDir, remote, baseBranch, featureBranch, isOnDefaultBranch);
  if (diffResult.error) {
    return diffResult.error;
  }

  // Get file stats for context
  const statsDiffRef = isOnDefaultBranch
    ? `${remote}/${featureBranch}..${featureBranch}`
    : `${remote}/${baseBranch}...${featureBranch}`;
  const statsResult = await runGitCommand(
    `diff --stat ${statsDiffRef}`,
    repoDir
  );

  // Build review prompt
  let output = '# Code Review Request\n\n';
  output += isOnDefaultBranch
    ? `**Branch:** \`${featureBranch}\` (unpushed commits)\n\n`
    : `**Branch:** \`${featureBranch}\` → \`${baseBranch}\`\n\n`;

  if (statsResult.exitCode === 0 && statsResult.output.trim()) {
    output += '## Change Summary\n```\n' + statsResult.output.trim() + '\n```\n\n';
  }

  output += '## Review Instructions\n\n';
  output += 'Report ONLY issues in this format:\n\n';
  output += '`file:line` - [severity] [issue] → [suggestion]\n\n';
  output += 'Severity: 🔴 Critical | 🟠 Major | 🟡 Minor\n\n';
  output += 'Focus: Security, bugs, performance. Skip praise.\n\n';

  if (focusAreas) {
    output += `**Additional Focus:** ${focusAreas}\n\n`;
  }

  output += '## Diff\n\n```diff\n' + truncateContent(diffResult.diff!) + '\n```\n';

  return success(output);
}

// ============================================================================
// Tool: generate_pr_title
// ============================================================================

/** Parameters for generate_pr_title tool */
export interface GeneratePrTitleParams extends BranchParams {
  style?: 'conventional' | 'ticket' | 'descriptive';
}

/**
 * Generates a conventional PR title based on the changes.
 * Analyzes the diff to determine the type and scope of changes.
 */
export async function generatePrTitle(args?: GeneratePrTitleParams): Promise<ToolResult> {
  const repoDir = getWorkingDirectory();

  // Extract and validate parameters
  const branches = await extractBranchParameters(args, repoDir);
  if (branches.error) {
    return branches.error;
  }

  const { baseBranch, featureBranch, remote } = branches;
  const style = args?.style ?? 'conventional';

  // Fetch latest
  const fetchResult = await runGitCommand(`fetch ${remote}`, repoDir);
  if (fetchResult.exitCode !== 0) {
    return gitError('git fetch failed', fetchResult.output);
  }

  // Get diff stats and commit messages for context
  const statsResult = await runGitCommand(
    `diff --stat ${remote}/${baseBranch}...${featureBranch}`,
    repoDir
  );

  const logResult = await runGitCommand(
    `log --oneline ${remote}/${baseBranch}..${featureBranch}`,
    repoDir
  );

  // Extract ticket number from branch name if present
  const ticketMatch = featureBranch.match(/[A-Za-z]+-\d+/i);
  const ticketNumber = ticketMatch ? ticketMatch[0].toUpperCase() : null;

  // Build the response
  let output = '# PR Title Generator\n\n';
  output += `**Branch:** \`${featureBranch}\`\n`;
  output += `**Style:** ${style}\n`;
  if (ticketNumber) {
    output += `**Ticket:** ${ticketNumber}\n`;
  }
  output += '\n';

  output += '## Commits in this PR\n```\n' + logResult.output.trim() + '\n```\n\n';
  output += '## Files Changed\n```\n' + statsResult.output.trim() + '\n```\n\n';

  output += '## Instructions\n\n';
  output += 'Based on the commits and changes above, generate a PR title following these guidelines:\n\n';

  switch (style.toLowerCase()) {
    case 'conventional':
      output += '**Format:** `type(scope): description`\n\n';
      output += 'Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`\n\n';
      output += 'Examples:\n';
      output += '- `feat(auth): add OAuth2 login support`\n';
      output += '- `fix(api): handle null response from external service`\n';
      output += '- `refactor(git): reorganize service into modular structure`\n';
      break;

    case 'ticket':
      output += `**Format:** \`[${ticketNumber ?? 'TICKET-XXX'}] Description\`\n\n`;
      output += 'Examples:\n';
      output += '- `[PROJ-123] Add user authentication flow`\n';
      output += '- `[BUG-456] Fix null reference in order processing`\n';
      break;

    default: // descriptive
      output += '**Format:** Clear, concise description starting with a verb\n\n';
      output += 'Examples:\n';
      output += '- `Add OAuth2 login support for enterprise users`\n';
      output += '- `Fix null reference exception in order processing`\n';
      output += '- `Reorganize git service into modular architecture`\n';
      break;
  }

  output += '\n---\nPlease provide 2-3 title suggestions based on the actual changes.\n';

  return success(output);
}

// ============================================================================
// Tool: generate_pr_description
// ============================================================================

/** Parameters for generate_pr_description tool */
export interface GeneratePrDescriptionParams extends BranchParams {
  includeChecklist?: boolean;
  ticketUrl?: string;
}

/**
 * Generates a complete PR description including summary, changes, and checklist.
 * Ready to paste directly into the PR description field.
 */
export async function generatePrDescription(args?: GeneratePrDescriptionParams): Promise<ToolResult> {
  const repoDir = getWorkingDirectory();

  // Extract and validate parameters
  const branches = await extractBranchParameters(args, repoDir);
  if (branches.error) {
    return branches.error;
  }

  const { baseBranch, featureBranch, remote, isOnDefaultBranch } = branches;
  const includeChecklist = args?.includeChecklist ?? true;
  const ticketUrl = args?.ticketUrl;

  // Fetch latest
  const fetchResult = await runGitCommand(`fetch ${remote}`, repoDir);
  if (fetchResult.exitCode !== 0) {
    return gitError('git fetch failed', fetchResult.output);
  }

  // Get various context - use appropriate diff reference
  const diffRef = isOnDefaultBranch
    ? `${remote}/${featureBranch}..${featureBranch}`
    : `${remote}/${baseBranch}...${featureBranch}`;
  const logRef = isOnDefaultBranch
    ? `${remote}/${featureBranch}..${featureBranch}`
    : `${remote}/${baseBranch}..${featureBranch}`;

  const statsResult = await runGitCommand(
    `diff --stat ${diffRef}`,
    repoDir
  );

  const logResult = await runGitCommand(
    `log --oneline ${logRef}`,
    repoDir
  );

  const diffResult = await getDiff(repoDir, remote, baseBranch, featureBranch, isOnDefaultBranch);
  if (diffResult.error) {
    return diffResult.error;
  }

  // Extract ticket from branch if no URL provided
  const ticketMatch = featureBranch.match(/[A-Za-z]+-\d+/i);
  const ticketNumber = ticketMatch ? ticketMatch[0].toUpperCase() : null;

  // Build the response
  let output = '# PR Description Generator\n\n';
  output += isOnDefaultBranch
    ? `**Branch:** \`${featureBranch}\` (unpushed commits)\n`
    : `**Branch:** \`${featureBranch}\` → \`${baseBranch}\`\n`;
  if (ticketNumber) {
    output += `**Ticket:** ${ticketNumber}\n`;
  }
  output += '\n';

  output += '## Commits\n```\n' + logResult.output.trim() + '\n```\n\n';
  output += '## Files Changed\n```\n' + statsResult.output.trim() + '\n```\n\n';
  output += '## Diff\n```diff\n' + truncateContent(diffResult.diff!) + '\n```\n\n';

  output += '---\n\n';
  output += '## Instructions\n\n';
  output += 'Based on the commits, files changed, and diff above, generate a PR description using this template:\n\n';
  output += '```markdown\n';
  output += '## Summary\n[Brief description of what this PR does and why]\n\n';

  if (ticketUrl) {
    output += '## Related Issue\n';
    output += `[${ticketNumber ?? 'Ticket'}](${ticketUrl})\n\n`;
  } else if (ticketNumber) {
    output += '## Related Issue\n' + ticketNumber + '\n\n';
  }

  output += '## Changes\n';
  output += '- [List key changes, one per line]\n';
  output += '- [Focus on WHAT changed and WHY]\n';
  output += '- [Group related changes together]\n\n';
  output += '## Testing\n';
  output += '- [How was this tested?]\n';
  output += '- [Any manual testing steps needed?]\n';
  output += '- [Were unit tests added/updated?]\n';

  if (includeChecklist) {
    output += '\n## Checklist\n';
    output += '- [ ] Code follows project style guidelines\n';
    output += '- [ ] Self-review completed\n';
    output += '- [ ] Tests added/updated for changes\n';
    output += '- [ ] Documentation updated if needed\n';
    output += '- [ ] No breaking changes (or documented)\n';
  }

  output += '```\n\n';
  output += 'Please fill in the template based on the actual changes shown above.\n';

  return success(output);
}
