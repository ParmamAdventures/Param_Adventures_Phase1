import { useState, useCallback } from "react";

/**
 * useModalState - Custom hook for managing modal open/close state.
 * Simplifies modal state management and reduces boilerplate.
 *
 * @param {boolean} [initialOpen=false] - Initial open state
 * @returns {Object} Modal state and handlers
 * @returns {boolean} isOpen - Whether modal is open
 * @returns {Function} open - Function to open modal
 * @returns {Function} close - Function to close modal
 * @returns {Function} toggle - Function to toggle modal state
 *
 * @example
 * const { isOpen, open, close, toggle } = useModalState();
 *
 * return (
 *   <>
 *     <button onClick={open}>Open Modal</button>
 *     {isOpen && (
 *       <Dialog onOpenChange={close}>
 *         <DialogContent>
 *           <p>Modal content</p>
 *           <button onClick={close}>Close</button>
 *         </DialogContent>
 *       </Dialog>
 *     )}
 *   </>
 * );
 */
export function useModalState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return { isOpen, open, close, toggle };
}
