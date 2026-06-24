import { Link } from 'react-router-dom';
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-lg text-slate-600 mb-6">Page not found</p>
        <Link to="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  );
}
