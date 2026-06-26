import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Group, Rect, Text } from 'react-konva';

// ─────────────────────────────────────────────────────────────────────────────
// AppErrorBoundary — wraps the entire app, last-resort catch-all
// Use in: main.jsx
// ─────────────────────────────────────────────────────────────────────────────
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[App Crash]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, showDetails } = this.state;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center w-screen h-screen bg-gray-50 gap-6 p-8"
      >
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            An unexpected error crashed the application. Your work may have been saved automatically.
          </p>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={14} />
              Reload App
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Home size={14} />
              Go to Dashboard
            </button>
          </div>

          {/* Collapsible error details for debugging */}
          <button
            onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
            aria-expanded={showDetails}
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showDetails ? 'Hide' : 'Show'} error details
          </button>

          {showDetails && error && (
            <pre className="text-left text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 w-full overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {error.toString()}
              {'\n'}
              {error.stack?.split('\n').slice(0, 6).join('\n')}
            </pre>
          )}
        </div>
      </div>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BoardErrorBoundary — wraps the canvas board, allows graceful recovery
// Use in: BoardPage.jsx or BoardLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
export class BoardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Board Crash]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center w-full h-full bg-gray-50 gap-5"
      >
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Canvas error</h2>
          <p className="text-gray-500 text-sm">
            The board canvas encountered an error. You can try reloading, or return to the dashboard.
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              <Home size={14} />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CanvasElementErrorBoundary — wraps each element inside the Konva Layer
// Renders a Konva-native fallback Rect so the Stage stays alive
// Use in: ElementRenderer.jsx
// ─────────────────────────────────────────────────────────────────────────────
export class CanvasElementErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const elementId = this.props.elementId || 'unknown';
    const elementType = this.props.elementType || 'unknown';
    console.error(`[Element Crash] id=${elementId} type=${elementType}`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { element } = this.props;

    // Render a Konva-safe placeholder that won't crash the Stage
    if (!element) return null;

    const w = element.width || 120;
    const h = element.height || 40;

    return (
      <Group x={element.x || 0} y={element.y || 0}>
        <Rect
          width={w}
          height={h}
          fill="#FFF3F3"
          stroke="#FCA5A5"
          strokeWidth={1}
          cornerRadius={4}
          dash={[4, 4]}
        />
        <Text
          x={8}
          y={h / 2 - 6}
          text={`⚠ Render error (${element.type || 'unknown'})`}
          fontSize={11}
          fill="#DC2626"
          width={w - 16}
          ellipsis
        />
      </Group>
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// withErrorBoundary — HOC helper for function components
// Usage: export default withErrorBoundary(MyComponent, <FallbackUI />)
// ─────────────────────────────────────────────────────────────────────────────
export function withErrorBoundary(WrappedComponent, fallback = null) {
  class HOCBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error, info) {
      console.error(`[${WrappedComponent.displayName || WrappedComponent.name} Crash]`, error, info);
    }

    render() {
      if (this.state.hasError) return fallback;
      return <WrappedComponent {...this.props} />;
    }
  }

  HOCBoundary.displayName = `ErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  return HOCBoundary;
}
