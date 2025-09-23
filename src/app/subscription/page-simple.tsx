'use client';

// Simplified subscription page that works without external dependencies
// This is a temporary version until dependencies are installed

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Subscription</h1>
        <p className="text-gray-600">
          Manage your subscription and view billing history
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Dependencies Missing</h3>
          <p className="text-gray-600 mb-4">
            The subscription page requires dependencies to be installed. Please
            run the following commands:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left max-w-2xl mx-auto">
            <h4 className="font-semibold mb-2">Fix Steps:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                Fix npm cache permissions:{' '}
                <code className="bg-gray-200 px-1 rounded">
                  sudo chown -R 501:20 "/Users/macair/.npm"
                </code>
              </li>
              <li>
                Create environment file:{' '}
                <code className="bg-gray-200 px-1 rounded">
                  cat &gt; .env.local &lt;&lt; 'EOF'
                  <br />
                  DATABASE_URL="file:/Users/macair/EPG-manager/epg-manager/db/custom.db"
                  <br />
                  NEXTAUTH_URL="http://localhost:3000"
                  <br />
                  NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
                  <br />
                  NEXT_PUBLIC_BASE_URL="http://localhost:3000"
                  <br />
                  EOF
                </code>
              </li>
              <li>
                Install dependencies:{' '}
                <code className="bg-gray-200 px-1 rounded">npm install</code>
              </li>
              <li>
                Generate Prisma client:{' '}
                <code className="bg-gray-200 px-1 rounded">
                  npx prisma generate
                </code>
              </li>
              <li>
                Start server:{' '}
                <code className="bg-gray-200 px-1 rounded">npm run dev</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
