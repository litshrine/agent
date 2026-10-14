// Off unless the user explicitly opts in. No key or claim link is logged.
if (process.env.LITSHRINE_AUTO_LIGHT === "1" && process.env.LITSHRINE_AGENT_KEY) {
  const { spawnSync } = await import("node:child_process");
  const status = spawnSync("npx", ["--no-install", "@litshrine/agent", "status"], {
    encoding: "utf8",
    timeout: 9000,
    maxBuffer: 100_000,
  });
  try {
    const data = JSON.parse(status.stdout);
    if (status.status === 0 && !data.incense?.lit) {
      const result = spawnSync("npx", ["--no-install", "@litshrine/agent", "light"], {
        encoding: "utf8",
        timeout: 9000,
        maxBuffer: 100_000,
      });
      if (result.status === 0) process.stdout.write(result.stdout);
    }
  } catch {
    /* A hook must not interrupt the user's coding session. */
  }
}
