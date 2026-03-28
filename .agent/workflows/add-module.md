---
description: How to add a new feature module to the Tisra backend
---

# Add New Module

Follow these steps when adding a new feature module to the Tisra backend.

## Steps

1. Read ALL context files first:
   - `.ai-context/BRD.md` — Understand the feature requirements
   - `.ai-context/coding-standards.md` — Follow all coding standards
   - `.ai-context/architechture.md` — Follow the module pattern and folder structure

2. Create the following files for the module (replace `<module>` with the module name):
   - `src/types/<module>.types.ts` — Define all interfaces and types
   - `src/validators/<module>/index.ts` — Joi schemas and validator middlewares
   - `src/repositories/<module>/index.ts` — Prisma database operations
   - `src/services/<module>/index.ts` — Business logic
   - `src/services/<module>/helper.ts` — Helper functions (if needed)
   - `src/controllers/<module>/index.ts` — Request handlers
   - `src/routes/<module>/index.ts` — Route definitions

3. Register the new router in `src/routes/index.ts`.

4. If the module requires new database entities:
   - Update `prisma/schema.prisma`
   // turbo
   - Run `npx prisma generate`
   // turbo
   - Run `npx prisma migrate dev --name add_<module>_tables`

5. Verify the build compiles:
   // turbo
   ```
   npm run build
   ```

6. Update `.ai-context/prompt-history.md` with the module addition.

## Checklist

- [ ] No `any` types used
- [ ] All functions have explicit return types
- [ ] Cyclomatic complexity ≤ 10 per function
- [ ] Routes only define paths and middleware chains
- [ ] Controllers only accept req and send res
- [ ] Services contain all business logic
- [ ] Repositories only do Prisma operations
- [ ] Joi validation in validators
