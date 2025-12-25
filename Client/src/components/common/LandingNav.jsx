import { Link } from 'react-router-dom';

export default function LandingNav() {
  return (
    <nav className="w-full bg-white/90 backdrop-blur border-b border-indigo-100 shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">iVisitor</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="rounded-md bg-indigo-600 px-5 py-2 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
