# Notes on Serverless Cold Starts

Cold starts are the persistent gotcha of serverless platforms. Here are the patterns I've found most useful working on Lambda-heavy systems.

## What actually causes a cold start

Three things, in roughly this order:

1. **Container provisioning** — AWS spins up a fresh execution environment
2. **Runtime initialization** — Node.js boots, modules load
3. **Handler initialization** — your top-level code runs (DB clients, SDK setup, etc.)

The first is largely out of your control. The other two are not.

## What you can control

- **Bundle size**. Tree-shake aggressively. A 50MB bundle takes 50MB longer to load.
- **Top-level imports**. Don't import the whole AWS SDK; import only the clients you use.
- **Provisioned concurrency** for hot paths. Costs money but eliminates cold starts for known traffic.
- **HTTP/2 connection reuse**. Hoist clients to module scope.

```ts
// Bad — recreated every invocation
export const handler = async (event) => {
  const client = new DynamoDBClient({ region: 'us-east-1' })
  // ...
}

// Good — reused across warm invocations
const client = new DynamoDBClient({ region: 'us-east-1' })

export const handler = async (event) => {
  // ...
}
```

## When cold starts don't matter

If your function runs every 30 seconds, you'll basically never see a cold start. The problem is bursty traffic and infrequently used endpoints — admin tools, scheduled cleanups, payment webhook handlers that fire once a day.
