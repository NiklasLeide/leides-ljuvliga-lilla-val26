First-session initialization. Run this BEFORE doing anything else in a new project.

## Step 1 — Collect project details

Ask me these questions one at a time. Wait for each answer before asking the next:

1. What is the tech stack? (languages, frameworks, key libraries)
2. What is the command to run the app? (e.g. `npm run dev`, `python main.py`)
3. What is the command to run tests? (e.g. `npm test`, `pytest`)
4. What is the dev server command, if different from the run command? (e.g. `npm run dev`, `uvicorn main:app --reload`)

## Step 2 — Update CLAUDE.md

Open CLAUDE.md and replace the Stack and Commands sections with the real values:

- Replace `**Stack:** TBD ⚠️ — resolve this in first session` with the actual stack
- Replace the Commands block — remove the ⚠️ comment and fill in the real commands:
  ```bash
  [run command]              # start the app
  [test command]             # run tests
  [dev server command]       # dev server (if applicable)
  ./commit.sh "message"      # ALWAYS use this to commit — never bare git commit
  ```

## Step 3 — Check MAINTENANCE.md

Read @docs/MAINTENANCE.md. If the "How to run this project" section still has placeholder comments like `# [fill in your start command]`, update it with the real commands from Step 1.

## Step 4 — Confirm

Show me what was written to both files so I can verify. Then say:
"Project initialized. Run /project:brief to start your first session."
