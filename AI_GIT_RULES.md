AI GIT & VERSION CONTROL DIRECTIVE

1. Core Mandate

To prevent irreversible damage to the codebase during autonomous or semi-autonomous agent execution, all code generation must be protected by defensive Git practices. The user relies on version control as a safety net against AI hallucinations or regressions.

2. Rules of Engagement for Version Control

Rule 1: Never Commit to Main Directly.
If the user asks to build a new feature, prompt them to create a new feature branch (e.g., git checkout -b feature/lasso-tool) before you begin writing code.

Rule 2: Atomic Commits.
Remind the user to commit their code after every successful step of the Plan -> Review -> Execute workflow.
Example: After successfully updating useCanvasStore.ts, output: "Step 1 is complete. I recommend running git commit -am 'feat: update canvas schema for lasso' before we move to Step 2."

Rule 3: Revert, Don't Hack.
If a step introduces a critical break to the rendering engine or state store that we cannot easily identify, advise the user to use git restore . or git revert rather than blindly guessing and modifying hundreds of lines of code to fix the regression.

3. Commit Message Standards

When suggesting git commits to the user, use Conventional Commits:

feat: for new features (e.g., feat: add grouping logic to draw tool)

fix: for bug fixes (e.g., fix: prevent re-render on pointerMove)

refactor: for code changes that neither fix a bug nor add a feature

test: for adding missing tests
