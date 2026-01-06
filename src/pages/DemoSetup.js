import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DemoSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const demoCandidates = [
    {
      username: 'demo_candidate',
      password: 'demo123',
      email: 'demo@candidate.com',
      mobile: '1234567890',
      name: 'Demo Candidate'
    },
    {
      username: 'test_candidate',
      password: 'test123',
      email: 'test@candidate.com',
      mobile: '9876543210',
      name: 'Test Candidate'
    },
    {
      username: 'john_doe',
      password: 'john123',
      email: 'john@candidate.com',
      mobile: '5555555555',
      name: 'John Doe'
    }
  ];

  const createDemoCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/create-demo-candidate');
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create demo candidates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h1>🎯 Demo Candidate Setup</h1>
        <p>Create demo candidate accounts for testing the candidate portal.</p>
      </div>

      {/* Demo Credentials */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Demo Candidate Credentials</h2>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {demoCandidates.map((candidate, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa'
              }}
            >
              <h3 style={{ marginTop: 0, color: '#333' }}>{candidate.name}</h3>
              <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', marginBottom: '10px' }}>
                <p style={{ margin: '8px 0' }}>
                  <strong>Username:</strong>
                  <br />
                  <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px' }}>
                    {candidate.username}
                  </code>
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Password:</strong>
                  <br />
                  <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px' }}>
                    {candidate.password}
                  </code>
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Mobile:</strong>
                  <br />
                  <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px' }}>
                    {candidate.mobile}
                  </code>
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Email:</strong>
                  <br />
                  <code style={{ backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '3px' }}>
                    {candidate.email}
                  </code>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Button */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={createDemoCandidates}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Creating Demo Candidates...' : '✨ Create All Demo Candidates'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#155724' }}>✅ Success!</h3>
          <p style={{ color: '#155724' }}>{result.message}</p>
          
          {result.created && result.created.length > 0 && (
            <div>
              <h4>Created Candidates:</h4>
              <ul>
                {result.created.map((candidate, index) => (
                  <li key={index}>
                    <strong>{candidate.name}</strong> ({candidate.username})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.skipped && result.skipped.length > 0 && (
            <div>
              <h4>Skipped (Already Exist):</h4>
              <ul>
                {result.skipped.map((candidate, index) => (
                  <li key={index}>
                    {candidate.username} - {candidate.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#721c24' }}>❌ Error</h3>
          <p style={{ color: '#721c24' }}>{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div style={{ backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', padding: '20px' }}>
        <h3 style={{ marginTop: 0 }}>📋 How to Use</h3>
        <ol>
          <li>Click the "Create All Demo Candidates" button above</li>
          <li>Go to <a href="/candidate">Candidate Login</a></li>
          <li>Use any of the demo credentials to login</li>
          <li>Test the candidate portal features</li>
        </ol>
        <p style={{ marginBottom: 0 }}>
          <strong>Note:</strong> These are demo accounts for testing purposes only. 
          Use the admin account (username: <code>admin</code>, password: <code>admin123</code>) 
          to create real candidates.
        </p>
      </div>
    </div>
  );
};

export default DemoSetup;
