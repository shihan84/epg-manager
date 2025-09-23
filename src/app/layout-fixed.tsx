// Fixed layout.tsx that works without external dependencies
// This will be replaced with the full version after npm install

import React from 'react';

export const metadata = {
  title: 'EPG Manager - Electronic Program Guide Management System',
  description:
    'A comprehensive EPG management system for live TV channel streamers. Create, manage, and host your electronic program guides with ease.',
  keywords: [
    'EPG',
    'Electronic Program Guide',
    'TV streaming',
    'channel management',
    'XMLTV',
    'live TV',
  ],
  authors: [{ name: 'EPG Manager Team' }],
  openGraph: {
    title: 'EPG Manager',
    description:
      'Comprehensive EPG management system for live TV channel streamers',
    url: 'https://epg-manager.vercel.app',
    siteName: 'EPG Manager',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPG Manager',
    description:
      'Comprehensive EPG management system for live TV channel streamers',
  },
};

// Simple Error Boundary Component
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                margin: '0 auto 1rem',
                display: 'flex',
                height: '3rem',
                width: '3rem',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                backgroundColor: '#fef2f2',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            </div>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                style={{
                  borderRadius: '0.375rem',
                  backgroundColor: '#fef2f2',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#991b1b',
                    fontFamily: 'monospace',
                  }}
                >
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#f9fafb')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = 'white')
                }
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseOver={e =>
                  (e.currentTarget.style.backgroundColor = '#2563eb')
                }
                onMouseOut={e =>
                  (e.currentTarget.style.backgroundColor = '#3b82f6')
                }
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Providers Component
function SimpleProviders({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EPG Manager - Electronic Program Guide Management System</title>
        <meta
          name="description"
          content="A comprehensive EPG management system for live TV channel streamers. Create, manage, and host your electronic program guides with ease."
        />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #ffffff;
            color: #000000;
            line-height: 1.5;
          }
          * {
            box-sizing: border-box;
          }
        `}</style>
      </head>
      <body>
        <SimpleErrorBoundary>
          <SimpleProviders>{children}</SimpleProviders>
        </SimpleErrorBoundary>
      </body>
    </html>
  );
}
