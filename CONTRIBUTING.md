# Contributing to TRIPPLANNER

Thank you for your interest in improving TRIPPLANNER. The project is a Vite-powered React application for AI-assisted trip planning, Firebase-backed trip storage, and expense tracking. Contributions should preserve the existing user flows and keep configuration secrets out of the repository.

## Development setup

Use Node.js 22 or a compatible current LTS release, then install the locked dependencies:

```bash
npm ci
```

Create a local `.env` file from `.env.example` and provide the Firebase, Gemini, and Unsplash values required by the application. Never commit `.env`, API keys, service-account files, or other credentials.

## Local validation

Before opening a pull request, run the same checks used by continuous integration:

```bash
npm run lint
npm run build
```

Use `npm run dev` for interactive development and `npm run preview` to inspect a production build locally.

## Branches and commits

Create a focused branch from `main`, such as `feat/itinerary-sharing` or `fix/expense-total`. Keep commits small and use an imperative subject line. Conventional Commit prefixes such as `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, and `chore:` are recommended.

## Pull requests

Describe the user problem, the change made, and any Firebase, Gemini, or Unsplash configuration impact. Include screenshots or a short screen recording for visual changes. Report the commands you ran and their results, and call out breaking changes, data-model changes, or security considerations. Keep unrelated refactors out of the same pull request.

Pull requests are reviewed by the repository maintainer. A pull request may be merged after the CI workflow passes and the maintainer is satisfied that the change is scoped, documented, and safe for existing users.

## Reporting issues

Use the repository issue templates for reproducible bugs and focused feature requests. For security vulnerabilities, follow the process in [`SECURITY.md`](SECURITY.md) instead of opening a public issue.
