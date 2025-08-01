# AI Visibility Platform - Development Guidelines

## Important Development Process

### After Every Feature Implementation:
1. **Run Tests**: Always run the test suite after implementing any feature
2. **Debug Until Tests Pass**: If tests fail, continue debugging until all tests work
3. **Git Commit**: Make a git commit after successful feature implementation and testing

### Testing Commands:
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests (if available)
- `npm run lint` - Run linting
- `npm run type-check` - Run TypeScript type checking

### Git Workflow:
- Commit after each completed feature
- Use descriptive commit messages
- Test before committing

## Project Overview
Building an AI Visibility SaaS platform that helps companies track when their brand appears in AI search results (ChatGPT, Perplexity, etc.) and provides content recommendations.

## Tech Stack
- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- NextAuth.js with email/password
- Tailwind CSS + shadcn/ui components
- OpenAI API for monitoring
- Vercel deployment

## Environment Variables Needed
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENAI_API_KEY=
```