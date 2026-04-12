"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        >
          <span className="text-4xl">🌙</span>
          <p className="font-display text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Qualcosa è andato storto
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Ricarica la pagina per riprovare.
          </p>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => window.location.reload()}
          >
            Ricarica
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
