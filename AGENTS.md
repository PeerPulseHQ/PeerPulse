# AGENTS.md

Canonical rules for all AI coding agents working in this repository.

## Attribution

Do not add `Co-Authored-By`, `Generated-By`, `Reviewed-By`, or any other AI attribution to commit messages, code comments, or documentation. Commit messages describe the change only. All commits appear under the configured git identity, nothing else.

## Confidentiality

- Do not push to remote repositories without explicit instruction from the user.
- Do not suggest uploading, publishing, or sharing project content to any third-party service.
- Do not surface the working directory path, system hostname, git author name, or other host-identifying information in generated content.

## Commit hygiene

- Run `git status` and `git diff --staged` before every commit. Never stage `.env` files or any file containing credentials.
- Never use `--no-verify` to bypass pre-commit hooks.
- Never amend published commits.
- Never run `git push --force` to a shared or public remote.

## Operational context

This project operates pseudonymously. The git author identity is set in repository configuration. Use it exactly as configured. Never alter `user.name`, `user.email`, or signing config.
