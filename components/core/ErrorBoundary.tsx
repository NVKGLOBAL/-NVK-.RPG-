import React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare readonly props: Readonly<ErrorBoundaryProps>;
  declare state: ErrorBoundaryState;
  declare setState: (
    state: Partial<ErrorBoundaryState> | ((prev: ErrorBoundaryState) => Partial<ErrorBoundaryState>)
  ) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || "Unexpected rendering anomaly.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[NVK ErrorBoundary]", error, info);
  }

  handleRecover = () => {
    this.setState({ hasError: false, errorMessage: "" });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[240px] w-full bg-slate-950 border border-rose-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 text-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 text-2xl">
            <i className="ri-shield-flash-line"></i>
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-lg text-rose-300">
              {this.props.fallbackTitle || "Module Containment Active"}
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1 max-w-md break-words">
              {this.state.errorMessage}
            </p>
          </div>
          <button
            onClick={this.handleRecover}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Re-initialize Sector
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
