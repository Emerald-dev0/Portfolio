/**
 * `server-only` throws by design outside a React Server Component, so tests
 * alias it to this no-op. The restriction it enforces is a bundling guard for
 * Next, not behaviour under test.
 */
export {};
