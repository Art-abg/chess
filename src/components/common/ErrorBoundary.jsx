import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          background: '#1a1a1a', 
          color: '#fff', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ff6b6b' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '2rem', 
              padding: '10px 20px', 
              fontSize: '1rem', 
              cursor: 'pointer',
              background: '#4CAF50',
              border: 'none',
              color: 'white',
              borderRadius: '4px'
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
