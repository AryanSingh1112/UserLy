import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
    <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mb-6">
      <ShieldAlert className="w-10 h-10 text-rose-600" />
    </div>
    <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Access Denied</h1>
    <p className="text-slate-500 mb-8 max-w-md">
      You don't have the required permissions to access this page. Please contact your system administrator if you believe this is an error.
    </p>
    <Link to="/dashboard" className="btn-primary flex items-center gap-2">
      <ArrowLeft className="w-4 h-4" />
      Back to Dashboard
    </Link>
  </div>
);

export default Unauthorized;
