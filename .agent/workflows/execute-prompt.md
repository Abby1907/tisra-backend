---
description: How to execute the next AI prompt for Tisra backend development
---

# Execute Next Prompt

Follow these steps to execute the next prompt in the AI-first development pipeline.

## Steps

1. Read `.ai-context/prompt-history.md` to identify which prompt was last executed successfully.

2. Read `.ai-context/prompts.md` to find the **next** prompt to execute.

3. Read ALL context files before generating code:
   - `.ai-context/BRD.md`
   - `.ai-context/coding-standards.md`
   - `.ai-context/architechture.md`

4. Execute the prompt — generate all files listed in the prompt.

5. After generating code, verify:
   // turbo
   ```
   npm run build
   ```

6. If build succeeds, run lint:
   // turbo
   ```
   npm run lint
   ```

7. Update `.ai-context/prompt-history.md` with:
   - Current date & time (IST)
   - Prompt number and title
   - Status (✅ / ⚠️ / ❌)
   - Any notes about issues or manual fixes

8. If the build or lint fails, fix the issues and re-verify before logging as ✅.
