import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred in the financial engine.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('RupeeRun ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    try {
      localStorage.removeItem('rupeerun_v1_state');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen bg-[#090D16] text-slate-100 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-[#131C2E] border border-slate-800 rounded-xl p-6 space-y-4 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <h1 className="text-lg font-bold text-white">
              Financial Cockpit Recovery Mode
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-4 py-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State & Reload Cockpit</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
