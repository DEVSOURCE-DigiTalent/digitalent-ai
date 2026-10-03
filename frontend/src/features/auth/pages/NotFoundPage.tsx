import { Link } from 'react-router-dom';
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <p className="text-lg text-slate-600 mb-6">Không tìm thấy trang</p>
        <Link to="/" className="text-blue-600 hover:underline">Về trang chủ</Link>
      </div>
    </div>
  );
}
