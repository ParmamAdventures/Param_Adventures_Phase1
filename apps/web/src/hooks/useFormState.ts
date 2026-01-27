import { useState, useCallback } from "react";

/**
 * useFormState - Custom hook for managing form field state.
 * Reduces boilerplate for forms with multiple fields.
 *
 * @template T - Type of form data object
 * @param {T} initialValues - Initial form field values
 * @returns {Object} Form state and handlers
 * @returns {T} values - Current form field values
 * @returns {Function} handleChange - Handler for standard input change events
 * @returns {Function} setField - Function to update a specific field
 * @returns {Function} setValues - Function to update all values
 * @returns {Function} reset - Function to reset to initial values
 *
 * @example
 * const { values, handleChange, setField, reset } = useFormState({
 *   name: "",
 *   email: "",
 *   message: "",
 * });
 *
 * return (
 *   <form>
 *     <input name="name" value={values.name} onChange={handleChange} />
 *     <textarea name="message" value={values.message} onChange={handleChange} />
 *     <button onClick={reset}>Clear</button>
 *   </form>
 * );
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    },
    [],
  );

  const setField = useCallback(
    (field: keyof T, value: T[keyof T] | ((prev: T[keyof T]) => T[keyof T])) => {
      setValues((prev) => ({
        ...prev,
        [field]: typeof value === "function" ? (value as any)(prev[field]) : value,
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
  }, [initialValues, setValues]);

  return {
    values,
    handleChange,
    setField,
    setValues,
    reset,
  };
}
