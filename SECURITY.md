# Security Policy

## Supported versions

TRIPPLANNER is currently maintained on the default `main` branch. No separate release versions or long-term support branches are published at this time.

## Reporting a vulnerability

Please do not disclose a suspected vulnerability in a public issue. Use the repository’s private [security advisory reporting page](https://github.com/vincenzo-afk/TRIPPLANNER/security/advisories/new) when available. If that page is not available for your account, contact the maintainer through the [vincenzo-afk GitHub profile](https://github.com/vincenzo-afk) and include the repository name, affected file or flow, reproduction steps, and potential impact.

Do not include live credentials, Firebase service-account files, or private user data in a report. The project does not promise a fixed response time; reports will be reviewed as maintainer capacity permits.

## Security practices

The client reads configuration from Vite environment variables, and `.env` files are excluded from version control. Firebase Authentication protects application routes, and Firestore operations are scoped to the authenticated user in the application flow. API keys used by a browser build are not server-side secrets; configure provider restrictions and Firebase Security Rules in the relevant provider consoles.
