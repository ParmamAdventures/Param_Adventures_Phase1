import { useState, useCallback } from "react";

export interface AsyncState {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

/**
 * useAsyncOperation - Custom hook for managing async operation states.
 * Simplifies handling of loading, success, and error states in components.
 *
 * @template T - Type of data returned by the operation
 * @returns {Object} Async operation state and handlers
 * @returns {AsyncState} state - Current async state (status and error message)
 * @returns {Function} execute - Function to execute async operation
 * @returns {Function} reset - Function to reset state to idle
 *
 * @example
 * const { state, execute, reset } = useAsyncOperation();
 *
 * const handleSubmit = async () => {
 *   const result = await execute(async () => {
 *     const res = await apiFetch("/api/submit", { method: "POST" });
 *     return res.json();
 *   });
 * };
 */
export function useAsyncOperation<T = any>() {
  const [state, setState] = useState<AsyncState>({
    status: "idle",
  });

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setState({ status: "loading" });
    try {
      const result = await operation();
      setState({ status: "success" });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setState({ status: "error", error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, execute, reset };
}
