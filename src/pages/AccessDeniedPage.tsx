import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You do not have permission to view this board. Please request access from the board owner or check if you have the correct link.
        </p>
        <Link 
          to="/dashboard"
          className="inline-flex justify-center w-full px-4 py-2.5 bg-brand text-white font-medium rounded-lg hover:bg-brand-dark transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
