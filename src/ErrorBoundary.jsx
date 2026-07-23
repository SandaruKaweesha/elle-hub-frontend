import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", background: "#fef2f2", color: "#991b1b", fontFamily: "sans-serif", minHeight: "100vh" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "12px" }}>Application Error Captured</h1>
          <p style={{ fontWeight: "bold", color: "#dc2626", marginBottom: "12px" }}>
            {this.state.error ? this.state.error.toString() : "Unknown Error"}
          </p>
          <pre style={{ background: "#18181b", color: "#f4f4f5", padding: "16px", borderRadius: "8px", overflowX: "auto", fontSize: "12px", lineHeight: "1.5" }}>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : (this.state.error?.stack || "No stack trace available.")}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
