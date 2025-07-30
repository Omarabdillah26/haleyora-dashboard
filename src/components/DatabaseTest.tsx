import React, { useState } from 'react';
import { useDatabase } from '../hooks/useDatabase';

const DatabaseTest: React.FC = () => {
  const { isConnected, loading, error, testConnection, getUsers } = useDatabase();
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestConnection = async () => {
    try {
      await testConnection();
      setTestResult({ success: true, message: 'Koneksi berhasil! (MySQL via API)' });
    } catch (err) {
      setTestResult({ success: false, message: `Error: ${err}` });
    }
  };

  const handleTestQuery = async () => {
    try {
      const users = await getUsers();
      setTestResult({ success: true, message: `Query berhasil! Jumlah users: ${users.length}`, data: users });
    } catch (err) {
      setTestResult({ success: false, message: `Query gagal: ${err}` });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Database Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold">Status Koneksi:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '✅ Connected (MySQL via API)' : '❌ Disconnected'}
          </span>
        </div>
        
        {loading && (
          <div className="text-blue-600">🔄 Testing connection...</div>
        )}
        
        {error && (
          <div className="text-red-600">❌ Error: {error}</div>
        )}
      </div>

      {/* Test Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleTestConnection}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Connection
        </button>
        
        <button
          onClick={handleTestQuery}
          disabled={loading || !isConnected}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Query
        </button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`p-4 rounded ${
          testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-semibold ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.message}
          </div>
          
          {testResult.data && (
            <div className="mt-2">
              <div className="text-sm text-gray-600">Data dari database:</div>
              <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Database Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Database Configuration:</h3>
        <div className="text-sm space-y-1">
          <div><strong>Type:</strong> MySQL Database</div>
          <div><strong>Host:</strong> pintu2.minecuta.com</div>
          <div><strong>Port:</strong> 3306</div>
          <div><strong>Database:</strong> fdcdb</div>
          <div><strong>Connection:</strong> Via Backend API</div>
        </div>
      </div>

      {/* API Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-800">API Information:</h3>
        <div className="text-sm text-blue-700">
          <p><strong>Backend URL:</strong> http://localhost:3001</p>
          <p><strong>API Base:</strong> http://localhost:3001/api</p>
          <p><strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-semibold mb-2 text-yellow-800">Setup Instructions:</h3>
        <div className="text-sm text-yellow-700">
          <p>1. <strong>Start Backend:</strong> cd backend && npm install && npm run dev</p>
          <p>2. <strong>Backend URL:</strong> http://localhost:3001</p>
          <p>3. <strong>Frontend URL:</strong> http://localhost:5173 (or your Vite port)</p>
          <p>4. <strong>Test Connection:</strong> Click "Test Connection" button</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseTest; 