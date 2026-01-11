import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  Bell,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  Shield,
  Navigation,
  GitBranch,
} from 'lucide-react';
import LogoutModal from './LogoutModal';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { user } = useAuth();
  const { emergencyStatus } = useEmergency();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/emergency', icon: AlertTriangle, label: 'Emergency Control', alert: emergencyStatus.isActive },
    { path: '/locations', icon: MapPin, label: 'Location Management' },
    { path: '/coordinates', icon: Navigation, label: 'Building Coordinates' },
    { path: '/campus-nodes', icon: GitBranch, label: 'Campus Nodes (A*)' },
    { path: '/sos-alerts', icon: Bell, label: 'SOS Alerts' },
    { path: '/users', icon: Users, label: 'User Monitoring' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics & Reports' },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Emergency Banner */}
      {emergencyStatus.isActive && (
        <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-center animate-pulse-red">
          <AlertTriangle className="w-5 h-5 mr-2" />
          <span className="font-semibold">
            🚨 EMERGENCY MODE ACTIVE: {emergencyStatus.type?.toUpperCase()} 🚨
          </span>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white shadow-lg transition-all duration-300 fixed h-full z-30`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="font-bold text-red-700">ARound BulSU</h1>
                  <p className="text-xs text-amber-600">Admin Portal</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-700 font-medium border-l-4 border-amber-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${!sidebarOpen ? 'justify-center' : ''}`
                }
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.alert && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`flex items-center w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 ${
                !sidebarOpen ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
        >
          {/* Header */}
          <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-20">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Welcome back, {user?.name}</h2>
              <p className="text-sm text-gray-500">Last login: {formatDate(user?.lastLogin)}</p>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-amber-600">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </button>
                  <div className="border-t mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
