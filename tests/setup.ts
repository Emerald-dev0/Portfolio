/**
 * Every test runs against a throwaway in-memory database, never the local file
 * the dev server uses.
 */
process.env.CMS_DB_FILE = ":memory:";
process.env.STUDIO_PASSWORD = "test-password";
process.env.ANALYTICS_SALT = "test-salt";
delete process.env.BLOB_READ_WRITE_TOKEN;
