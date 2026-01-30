---
agent: 'agent'
description: 'Prepare a complete PR with review, title, and description'
---
Prepare a complete Pull Request:

1. Run `#review_code` to perform a thorough code review
2. Address any critical issues found before proceeding
3. Run `#find_secrets` to ensure no credentials are exposed
4. Generate a PR title with `#create_pr_title`
5. Generate a PR description with `#create_pr_body`

Compile the results into a ready-to-use PR package:

## PR Checklist
- [ ] Code reviewed for security issues
- [ ] No secrets or credentials in code
- [ ] Tests pass locally
- [ ] Documentation updated if needed

## Generated PR Title
{title from create_pr_title}

## Generated PR Description
{description from create_pr_body}
