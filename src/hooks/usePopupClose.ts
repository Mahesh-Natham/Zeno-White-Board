import { useEffect } from 'react';

export const usePopupClose = (ref, closeHandler, isOpen) => {
  useEffect(() => {
    // Do nothing if the popup isn't open
    if (!isOpen) return;

    // 1. Handle Click Outside
    const handleClickOutside = (event) => {
      // If the click target is NOT inside the referenced popup element, close it
      if (ref.current && !ref.current.contains(event.target)) {
        closeHandler();
      }
    };

    // 2. Handle Escape Keypress
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeHandler();
      }
    };

    // Attach global listeners
    // Use capture phase so we can catch the click before react-konva or other elements swallow it
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('keydown', handleEscapeKey, true);

    // Cleanup listeners when component unmounts or closes to prevent memory leaks
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscapeKey, true);
    };
  }, [ref, closeHandler, isOpen]); // Re-run if these values change
};
