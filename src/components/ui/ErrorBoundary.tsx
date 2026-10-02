import React from 'react';

interface State { hasError: boolean; error: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, error: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '40px auto', fontFamily: 'Noto Sans, Arial, sans-serif' }}>
          <div style={{ borderLeft: '4px solid #C62828', background: '#FDECEA', padding: '16px 20px', borderRadius: '4px' }}>
            <div style={{ fontWeight: '700', color: '#C62828', marginBottom: '8px', fontSize: '16px' }}>Something went wrong</div>
            <p style={{ margin: '0 0 12px', fontSize: '14px' }}>{this.state.error}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
              style={{ background: '#1F3A6E', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
