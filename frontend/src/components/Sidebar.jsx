import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Squares2X2Icon,
  ClipboardDocumentIcon,
  HeartIcon,
  UserGroupIcon,
  CalendarIcon,
  Cog6ToothIcon,
  BeakerIcon,
  ChatBubbleLeftEllipsisIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

function Sidebar({ onClose, isLargeScreen }) {
  const location = useLocation();
  
  const sidebar_menu = [
    { name: 'Dashboard', icon: Squares2X2Icon, path: '/dashboard' },
    { name: 'Medical Record', icon: ClipboardDocumentIcon, path: '/medicalrecord' },
    { name: 'Health Issues', icon: HeartIcon, path: '/healthissues' },
    { name: 'Medications', icon: BeakerIcon, path: '/medication' },
    { name: 'AI Assistant', icon: ChatBubbleLeftEllipsisIcon, path: '/chatbot' },
    { name: 'Clinicians', icon: UserGroupIcon, path: '/clinicians' },
    { name: 'Appointments', icon: CalendarIcon, path: '/appointments' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  ];

  const isActiveRoute = (path) => {
    // Check if the current path starts with the menu item path
    // This handles both exact matches and nested routes
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-teal-900 min-h-screen text-white p-4 space-y-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Amarhealth Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-2xl font-bold">Amarhealth</h1>
        </div>
        
        {/* Close button - only shown on mobile */}
        {!isLargeScreen && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-teal-800 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
      
      <nav className="space-y-2">
        {sidebar_menu.map((item) => {
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 space-x-3 w-full rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-700 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-teal-800 hover:text-white'
              }`}
              onClick={!isLargeScreen ? onClose : undefined}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-8 bg-white rounded-full absolute right-0 mr-1" />
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-teal-800 p-4 rounded-lg">
          <p className="text-sm text-gray-300">Need help?</p>
          <button className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
  isLargeScreen: PropTypes.bool.isRequired,
};

export default Sidebar;
