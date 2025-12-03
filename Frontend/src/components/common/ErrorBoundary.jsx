import React from "react";

/**
 * Global error boundary for React components.
 * Catches rendering errors and shows a fallback UI instead of crashing the app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("💥 React ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    // Optional: refresh app when user clicks retry
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong 😕
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload App
          </button>
        </div>
      );
    }

    // When no error → render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
