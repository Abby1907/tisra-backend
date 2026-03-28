---
description: How to verify coding standards compliance in the Tisra backend
---

# Verify Standards

Run this workflow to check that the codebase follows all coding standards.

## Steps

1. Read `.ai-context/coding-standards.md` to understand the rules.

2. Check for `any` type usage:
   // turbo
   ```
   npx grep -r ":\s*any\b" src/ --include="*.ts" || echo "No any types found ✅"
   ```

3. Verify TypeScript strict compilation:
   // turbo
   ```
   npm run build
   ```

4. Run linting:
   // turbo
   ```
   npm run lint
   ```

5. Check for missing return types — search for functions without explicit return types:
   // turbo
   ```
   npx grep -rn "=> {" src/ --include="*.ts" | head -20
   ```

6. Verify layer separation:
   - Controllers should NOT import from repositories directly
   - Routes should NOT import from services or repositories
   - Repositories should NOT import from controllers or services
   
   // turbo
   ```
   npx grep -rn "from.*repositories" src/controllers/ --include="*.ts" || echo "Controllers clean ✅"
   ```
   // turbo
   ```
   npx grep -rn "from.*services\|from.*repositories" src/routes/ --include="*.ts" || echo "Routes clean ✅"
   ```

7. Report findings and fix any violations.
