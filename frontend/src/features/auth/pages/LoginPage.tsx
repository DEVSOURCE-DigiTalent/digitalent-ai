import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api-client';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { getDefaultPath } from '../../../lib/sidebar-config';

/**
 * Login page.
 * Flow: POST /auth/login → save tokens → GET /auth/me → store user → redirect by role.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useCurrentUser((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Authenticate
      const loginRes = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = loginRes.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Step 2: Load current user profile (roles + permissions)
      const meRes = await apiClient.get('/auth/me');
      const user = meRes.data.data;
      setUser(user);

      // Step 3: Redirect to role-appropriate dashboard
      const homePath = getDefaultPath(user.roles);
      navigate(homePath, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">DigiTalent AI</h1>
        <h2 className="text-lg text-center text-slate-600 mb-8">Sign in to your account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md" placeholder="you@company.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
