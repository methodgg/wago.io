# Wago v3

Wago version 3 found at https://wago.io

# What's new?

Wago is now setup up to support internationalization! If you're interested in volunteering to translate to your language then check out the [translation doc](translation.md) and find me on Discord.

## WeakAuras OpenAPI contract

The public API contract used by Wago App is committed at
`public/openapi.json`. It documents only the WeakAuras endpoints used by the
app. Production serves the same contract at
`https://data.wago.io/openapi.json`.

The backend generates the contract before it starts. This keeps the deployed
contract aligned with the deployed server code even though deployment is
managed outside this repository. To update or check the committed file:

```sh
cd backend
npm run openapi
npm run openapi:check
```

The generator uses only Node.js built-in modules. CI runs the check command
directly and does not use Git to detect drift, so it does not depend on Git
safe-directory configuration.
