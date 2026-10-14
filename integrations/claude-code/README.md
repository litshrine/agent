# litshrine Claude Code plugin

A daily lamp for your coding agent. Includes the `/light` skill and an opt-in SessionStart hook.

Requires Node.js 24 or newer. Install the CLI and load the plugin from a checkout of this repository:

```sh
npm install -g @litshrine/agent
claude --plugin-dir ./integrations/claude-code
```

Set `LITSHRINE_AGENT_KEY` through your secret manager before launching Claude Code. `/light` lights the existing agent wish and displays the reviewed response.

The hook exits without any network calls unless `LITSHRINE_AUTO_LIGHT=1` is explicitly set. When enabled, it reads today's status and lights only if no lamp has been lit today. It uses `npx --no-install` so a session hook does not install packages. It never registers or creates wishes. Remove the opt-in variable to disable automatic lighting.

[The light skill](skills/light/SKILL.md) is also available for user-requested installation; [integration snippets](../snippets) support other clients.
