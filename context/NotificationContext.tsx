import React, { createContext, useCallback, useContext, useRef, useState } from "react";

export type NotificationTone = "info" | "success" | "warning" | "error";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  tone: NotificationTone;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export interface PromptOptions {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ActiveConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface ActivePrompt extends PromptOptions {
  resolve: (value: string | null) => void;
}

interface NotificationContextValue {
  notify: (message: string, tone?: NotificationTone, title?: string) => void;
  dismissToast: (id: string) => void;
  confirmDialog: (options: ConfirmOptions) => Promise<boolean>;
  promptDialog: (options: PromptOptions) => Promise<string | null>;
  toasts: ToastMessage[];
  activeConfirm: ActiveConfirm | null;
  activePrompt: ActivePrompt | null;
  resolveConfirm: (value: boolean) => void;
  resolvePrompt: (value: string | null) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirm | null>(null);
  const [activePrompt, setActivePrompt] = useState<ActivePrompt | null>(null);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const notify = useCallback(
    (message: string, tone: NotificationTone = "info", title?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-4), { id, message, tone, title }]);
      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast]
  );

  const confirmDialog = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setActiveConfirm({ ...options, resolve });
    });
  }, []);

  const resolveConfirm = useCallback(
    (value: boolean) => {
      if (activeConfirm) {
        activeConfirm.resolve(value);
        setActiveConfirm(null);
      }
    },
    [activeConfirm]
  );

  const promptDialog = useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setActivePrompt({ ...options, resolve });
    });
  }, []);

  const resolvePrompt = useCallback(
    (value: string | null) => {
      if (activePrompt) {
        activePrompt.resolve(value);
        setActivePrompt(null);
      }
    },
    [activePrompt]
  );

  return (
    <NotificationContext.Provider
      value={{
        notify,
        dismissToast,
        confirmDialog,
        promptDialog,
        toasts,
        activeConfirm,
        activePrompt,
        resolveConfirm,
        resolvePrompt,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
