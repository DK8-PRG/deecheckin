// ---------------------------------------------------------------------------
// Shared types used across features
// ---------------------------------------------------------------------------

/** Generic action result wrapper for Server Actions. */
export type ActionResult<T = void> =
  | { success: true; data: T; warnings?: string[] }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
