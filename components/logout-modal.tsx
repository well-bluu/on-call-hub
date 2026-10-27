"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  // Close the modal when Escape is pressed
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    // Dark overlay - clicking outside the box closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      {/* Modal box - stopPropagation so clicking inside doesn't close it */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-white px-6 py-7 text-center shadow-xl"
      >
        {/* Title */}
        <h2
          id="logout-modal-title"
          className="text-xl font-extrabold tracking-tight text-[hsl(var(--dark-blue))]"
        >
          LOGOUT CONFIRMATION
        </h2>

        {/* Message - CHANGE if you want different wording */}
        <p className="mx-auto mt-3 max-w-xs text-sm leading-snug text-[hsl(var(--dark-blue))]">
          Are you sure you want to log out? You can sign back in anytime to
          continue managing your shifts.
        </p>

        {/* Buttons */}
        <div className="mt-5 flex flex-row gap-3">
          {/* Cancel button (outlined blue) */}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-[1.5px] border-[#0050D3] bg-white py-2.5 text-xs font-bold text-[#0050D3] transition-colors hover:bg-[#E6EFFD]"
          >
            NO, CANCEL
          </button>

          {/* Confirm button (solid red) */}
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#FF0000] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#D90000]"
          >
            YES, LOGOUT
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}