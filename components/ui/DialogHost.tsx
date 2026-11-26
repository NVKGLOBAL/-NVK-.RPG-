import React, { useEffect, useState } from "react";
import { useNotifications, type NotificationTone } from "../../context/NotificationContext";

const TONE_STYLES: Record<NotificationTone, { border: string; bg: string; icon: string; text: string }> = {
  info: {
    border: "border-indigo-500/60",
    bg: "bg-slate-900/95",
    icon: "ri-information-line text-indigo-400",
    text: "text-slate-100",
  },
  success: {
    border: "border-emerald-500/60",
    bg: "bg-emerald-950/95",
    icon: "ri-checkbox-circle-line text-emerald-400",
    text: "text-emerald-100",
  },
  warning: {
    border: "border-amber-500/60",
    bg: "bg-amber-950/95",
    icon: "ri-alert-line text-amber-400",
    text: "text-amber-100",
  },
  error: {
    border: "border-rose-500/60",
    bg: "bg-rose-950/95",
    icon: "ri-error-warning-line text-rose-400",
    text: "text-rose-100",
  },
};

export const DialogHost: React.FC = () => {
  const { toasts, dismissToast, activeConfirm, activePrompt, resolveConfirm, resolvePrompt } =
    useNotifications();
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    if (activePrompt) {
      setPromptValue(activePrompt.defaultValue || "");
    }
  }, [activePrompt]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeConfirm) resolveConfirm(false);
        if (activePrompt) resolvePrompt(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeConfirm, activePrompt, resolveConfirm, resolvePrompt]);

  return (
    <>
      {/* Non-blocking Toasts */}
      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-[12000] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
          aria-live="polite"
        >
          {toasts.map((toast) => {
            const style = TONE_STYLES[toast.tone];
            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${style.border} ${style.bg} backdrop-blur-xl shadow-2xl`}
              >
                <i className={`${style.icon} text-lg shrink-0 mt-0.5`}></i>
                <div className="flex-grow min-w-0">
                  {toast.title && (
                    <div className="text-xs font-cinzel font-bold uppercase tracking-wider text-white mb-0.5">
                      {toast.title}
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed ${style.text}`}>{toast.message}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-slate-400 hover:text-white p-0.5 shrink-0"
                  aria-label="Dismiss notification"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      {activeConfirm && (
        <div
          className="fixed inset-0 z-[13000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nvk-confirm-title"
        >
          <div className="w-full max-w-md bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 id="nvk-confirm-title" className="text-lg font-cinzel font-bold text-white flex items-center gap-2">
              <i
                className={
                  activeConfirm.destructive
                    ? "ri-alert-line text-rose-400"
                    : "ri-question-line text-indigo-400"
                }
              ></i>
              {activeConfirm.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{activeConfirm.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => resolveConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                {activeConfirm.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className={`px-4 py-2 rounded-lg text-white text-xs font-semibold ${
                  activeConfirm.destructive
                    ? "bg-rose-600 hover:bg-rose-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {activeConfirm.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Dialog */}
      {activePrompt && (
        <div
          className="fixed inset-0 z-[13000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nvk-prompt-title"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              resolvePrompt(promptValue.trim() ? promptValue.trim() : null);
            }}
            className="w-full max-w-md bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-6 space-y-4"
          >
            <h3 id="nvk-prompt-title" className="text-lg font-cinzel font-bold text-indigo-300">
              {activePrompt.title}
            </h3>
            <p className="text-sm text-slate-300">{activePrompt.message}</p>
            <input
              type="text"
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={activePrompt.placeholder || "Enter value..."}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => resolvePrompt(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                {activePrompt.cancelLabel || "Cancel"}
              </button>
              <button
                type="submit"
                disabled={!promptValue.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                {activePrompt.confirmLabel || "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
