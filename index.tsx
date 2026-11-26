import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SovereignAIProvider } from './context/SovereignAIContext';
import { NarrationProvider } from './context/NarrationContext';
import { NotificationProvider } from './context/NotificationContext';
import { DialogHost } from './components/ui/DialogHost';
import { ErrorBoundary } from './components/core/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallbackTitle="NVK Codex Kernel Recovery">
      <NotificationProvider>
        <SovereignAIProvider>
          <NarrationProvider>
            <App />
            <DialogHost />
          </NarrationProvider>
        </SovereignAIProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
