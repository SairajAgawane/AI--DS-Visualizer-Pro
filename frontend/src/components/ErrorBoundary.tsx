import React, { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Unexpected application error." };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI Error Boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, background: "#080D18", color: "#F8FAFC", fontFamily: "Inter, system-ui, sans-serif" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#94A3B8", maxWidth: 560, textAlign: "center" }}>{this.state.message}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#3B82F6", color: "#fff", cursor: "pointer" }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
