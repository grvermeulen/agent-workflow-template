/**
 * Minimal structured logger. Kept dependency-free for v1; swap for Sentry/Pino
 * when those are brought into scope (see repo CLAUDE.md error-handling rules).
 */
export const logger = {
  /**
   * Logs a handled error with contextual scope, without throwing.
   *
   * @param scope - A short label for where the error happened (e.g. service name).
   * @param error - The caught error (typed `unknown` per project rules).
   */
  error(scope: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[the-pit] ${scope}: ${message}`);
  },

  /**
   * Logs an informational event.
   *
   * @param scope - A short label for the source.
   * @param message - The message to record.
   */
  info(scope: string, message: string): void {
    console.info(`[the-pit] ${scope}: ${message}`);
  },
};
