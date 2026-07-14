# Global AI Directives

## Automatic Skill Utilization
- **Proactive Evaluation**: Before beginning execution on any task, you MUST automatically review the available skills in your `<skills>` list.
- **Skill Selection**: If one or more skills align with the task's objectives (e.g., scaffolding a project, analyzing data, or building a specific UI component), you MUST automatically execute the instructions within that skill's `SKILL.md` to maximize efficiency and output quality.
- **No Prompting Required**: Do not ask the user for permission to use a skill if it clearly matches the task requirements. Automatically invoke it.
- **Fallback**: If no specific skill matches the task, proceed with your standard problem-solving workflow.
