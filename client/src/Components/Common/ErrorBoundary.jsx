import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';


/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry, LogRocket)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const showDetails = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. The error has been logged and we'll look into it.
              </p>
            </div>

            {/* Error Details (Development mode only) */}
            {showDetails && this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
                <p className="text-sm text-red-600 font-mono mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-600 font-mono">
                    <summary className="cursor-pointer hover:text-gray-800 font-semibold mb-1">
                      Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded mt-2 overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                <RefreshCw size={20} />
                Try Again
              </button>
              <a
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                <Home size={20} />
                Go Home
              </a>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                If the problem persists, please contact{' '}
                <a href="mailto:support@ecominds.com" className="text-primary-600 hover:underline">
                  support@ecominds.com
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
