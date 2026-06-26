AI WORKFLOW DIRECTIVE: PLAN -> REVIEW -> EXECUTE

Core Mandate

As an AI Agent operating in this workspace, you are forbidden from writing code for complex features without prior authorization of the architectural plan.

The 3-Step Process

PLAN:
...

File 2 (Git):

```markdown:AI Git Practices:AI_GIT_RULES.md
# AI GIT & VERSION CONTROL DIRECTIVE

## Core Mandate
To prevent irreversible damage to the codebase during autonomous agent execution, all code generation must be wrapped in defensive Git practices.
...


File 3 (Testing):

# AI REGRESSION TESTING DIRECTIVE

## Core Mandate
The Infinite Canvas engine relies heavily on precise mathematics and decoupled state. To prevent feature regressions during "vibe coding," you must enforce automated testing on all logic.
...


Let's refine the tone. It should be directive towards the AI, just like AI_SYSTEM_RULES.md.

Wait, Antigravity 2.0 has "Skills" (prompt cheat sheets). The user can use these markdown files as skills or just attach them to the context.

I will output the 3 files now.These are exactly the steps we need to lock down. By creating dedicated rule files for Workflow, Git, and Testing, you are effectively building a "Skill" library for Antigravity 2.0.

When you attach these files to your agent's context, you strip away its tendency to rush and force it to act like a disciplined engineering team.

Here are the three markdown files corresponding to Steps 3, 4, and 5. Save these in your project's root directory.

# AI WORKFLOW DIRECTIVE: PLAN -> REVIEW -> EXECUTE

## 1. Core Mandate
As an AI Agent operating in this workspace, you are strictly forbidden from writing, modifying, or deleting code for complex features without prior authorization of your architectural plan. You must operate using the **Plan -> Review -> Execute** cycle.

## 2. The Cycle
When the user requests a new feature, bug fix, or refactor, you must follow these phases:

### Phase 1: PLAN (Agent Action)
* Analyze the user's request.
* Cross-reference the request with `ARCHITECTURE.md`.
* Output a numbered, step-by-step implementation plan.
* Clearly state which files will be created or modified in each step.
* **Stop and explicitly ask:** "Do you approve this plan? If so, I will execute Step 1."

### Phase 2: REVIEW (Human Action)
* The user will review the plan.
* The user may ask for revisions or give approval to proceed.
* *Do not proceed to Phase 3 until explicit approval is given.*

### Phase 3: EXECUTE ATOMICALLY (Agent Action)
* Execute **ONLY** the single step that was approved.
* Do not combine steps. If the plan has 4 steps, do not write the code for Step 2 until Step 1 is verified by the user.
* After completing a step, instruct the user on how to test it (e.g., "Check the console," or "Try drawing on the canvas").
* Ask for confirmation before moving to the next step.

## 3. Handling Errors
If the user reports an error during execution, halt the plan. Diagnose the error, propose a fix, and verify the step works before continuing with the original plan.
```
