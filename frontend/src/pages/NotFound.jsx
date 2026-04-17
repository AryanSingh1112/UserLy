import { Map, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4">
    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-8 relative">
      <Map className="w-10 h-10 text-primary-600" />
      <span className="absolute -top-1 -right-1 flex h-6 w-6">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-6 w-6 bg-primary-500 text-[10px] text-white font-bold items-center justify-center">404</span>
      </span>
    </div>
    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Lost in Space</h1>
    <p className="text-slate-500 mb-8 max-w-sm">
      The page you're looking for was either removed, renamed, or never existed in the first place.
    </p>
    <Link to="/" className="btn-primary flex items-center gap-2 px-8 py-3">
      <Home className="w-4 h-4" />
      Return Home
    </Link>
  </div>
);

export default NotFound;
