import { Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightStartOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// No navigation links needed

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link 
                to={isAuthenticated ? "/guard" : "/"} 
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
              >
                iVisitor
              </Link>
              {isAuthenticated && (
                <div className="ml-3 text-sm text-gray-500">Guard Dashboard</div>
              )}
            </div>
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-1.5" />
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="py-10">
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
