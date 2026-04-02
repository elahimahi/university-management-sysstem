import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { API_BASE_URL } from '../constants/app.constants';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading' | 'pending';
  message: string;
  timestamp?: string;
}

const DiagnosticsPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Backend API Connection', status: 'pending', message: 'Checking...' },
    { name: 'Database Connection', status: 'pending', message: 'Checking...' },
    { name: 'Admin Registration Check', status: 'pending', message: 'Checking...' },
  ]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const newResults: TestResult[] = [...results];

    // Test 1: Backend API Connection
    try {
      const response = await fetch(`${API_BASE_URL}/test-connection.php`);
      const data = await response.json();

      if (response.ok) {
        newResults[0] = {
          name: 'Backend API Connection',
          status: 'success',
          message: data.message || 'Connected',
          timestamp: data.timestamp,
        };
        newResults[1] = {
          name: 'Database Connection',
          status: 'success',
          message: data.database || 'Database connected',
        };
      } else {
        newResults[0] = {
          name: 'Backend API Connection',
          status: 'error',
          message: `API returned status ${response.status}`,
        };
        newResults[1] = {
          name: 'Database Connection',
          status: 'error',
          message: 'Could not verify database connection',
        };
      }
    } catch (error: any) {
      newResults[0] = {
        name: 'Backend API Connection',
        status: 'error',
        message: `Connection refused: Make sure backend is running on ${API_BASE_URL}`,
      };
      newResults[1] = {
        name: 'Database Connection',
        status: 'error',
        message: 'Backend not reachable',
      };
    }

    // Test 2: Admin Registration Check
    try {
      const checkResponse = await fetch(`${API_BASE_URL}/admin/get_pending_registrations.php`);

      if (checkResponse.ok) {
        newResults[2] = {
          name: 'Admin Registration Check',
          status: 'success',
          message: 'System is ready for admin registration',
        };
      } else {
        newResults[2] = {
          name: 'Admin Registration Check',
          status: 'error',
          message: `API returned status ${checkResponse.status}`,
        };
      }
    } catch (error: any) {
      newResults[2] = {
        name: 'Admin Registration Check',
        status: 'error',
        message: 'Cannot verify admin registration endpoint',
      };
    }

    setResults(newResults);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-400" size={20} />;
      case 'loading':
      case 'pending':
        return <Clock className="text-yellow-400 animate-spin" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">🔍 System Diagnostics</h1>
        <p className="text-gray-300 mb-8">Checking backend, database, and admin system status...</p>

        <div className="space-y-4">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                result.status === 'success'
                  ? 'bg-green-900/20 border-green-500/50'
                  : result.status === 'error'
                    ? 'bg-red-900/20 border-red-500/50'
                    : 'bg-yellow-900/20 border-yellow-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h3 className="text-white font-bold">{result.name}</h3>
                    <p className="text-gray-300 text-sm">{result.message}</p>
                  </div>
                </div>
                {result.timestamp && (
                  <span className="text-xs text-gray-400">{result.timestamp}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
          <h3 className="text-white font-bold mb-2">📋 System Information</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>🔗 API Base URL: <code className="bg-black/30 px-2 py-1 rounded">{API_BASE_URL}</code></li>
            <li>⚙️ Frontend: Running (React on localhost:3000)</li>
            <li>🐘 Backend: PHP on localhost:8000</li>
            <li>🗄️ Database: MAHI\SQLEXPRESS (university_db)</li>
          </ul>
        </div>

        <div className="mt-8 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg">
          <h3 className="text-white font-bold mb-2">👑 Admin Registration Rules</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>✅ Only ONE admin account can be registered</li>
            <li>✅ Admin registration is auto-approved</li>
            <li>✅ Other users (student/faculty) need admin approval</li>
            <li>✅ Admins can approve/reject registrations at /admin/verify</li>
          </ul>
        </div>

        <button
          onClick={runDiagnostics}
          className="w-full mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
        >
          🔄 Run Diagnostics Again
        </button>
      </div>
    </div>
  );
};

export default DiagnosticsPage;
