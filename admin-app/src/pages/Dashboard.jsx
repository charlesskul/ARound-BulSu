import { Link } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';
import { mockAnalyticsData, mockSOSAlerts } from '../data/mockData';
import {
  Users,
  UserCheck,
  Navigation,
  Bell,
  AlertTriangle,
  MapPin,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  Clock,
} from 'lucide-react';

const Dashboard = () => {
  const { emergencyStatus, evacuationStats } = useEmergency();

  const activeAlerts = mockSOSAlerts.filter(a => a.status === 'active').length;

  const statCards = [
    {
      title: 'Total Users',
      value: mockAnalyticsData.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'primary',
      description: 'Registered app users',
    },
    {
      title: 'Active Today',
      value: mockAnalyticsData.activeToday.toLocaleString(),
      change: '+8%',
      changeType: 'increase',
      icon: UserCheck,
      color: 'success',
      description: 'Users active in last 24h',
    },
    {
      title: 'Total Navigations',
      value: mockAnalyticsData.totalNavigations.toLocaleString(),
      change: '+23%',
      changeType: 'increase',
      icon: Navigation,
      color: 'gold',
      description: 'Navigation requests today',
    },
    {
      title: 'Active SOS Alerts',
      value: activeAlerts,
      change: activeAlerts > 0 ? 'Needs attention' : 'All clear',
      changeType: activeAlerts > 0 ? 'alert' : 'neutral',
      icon: Bell,
      color: activeAlerts > 0 ? 'danger' : 'success',
      description: 'Pending SOS alerts',
    },
  ];

  const quickActions = [
    {
      title: 'Emergency Control',
      description: 'Activate or manage emergency mode',
      icon: AlertTriangle,
      path: '/emergency',
      color: emergencyStatus.isActive ? 'danger' : 'primary',
      badge: emergencyStatus.isActive ? 'ACTIVE' : null,
    },
    {
      title: 'Location Management',
      description: 'Add, edit, or remove campus locations',
      icon: MapPin,
      path: '/locations',
      color: 'gold',
    },
    {
      title: 'SOS Alerts',
      description: 'View and respond to student alerts',
      icon: Bell,
      path: '/sos-alerts',
      color: 'danger',
      badge: activeAlerts > 0 ? `${activeAlerts} Active` : null,
    },
    {
      title: 'User Monitoring',
      description: 'Monitor and manage user accounts',
      icon: Users,
      path: '/users',
      color: 'success',
    },
    {
      title: 'Analytics & Reports',
      description: 'View statistics and generate reports',
      icon: BarChart3,
      path: '/analytics',
      color: 'primary',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        light: 'bg-red-50',
      },
      success: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        light: 'bg-green-50',
      },
      warning: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        border: 'border-amber-200',
        light: 'bg-amber-50',
      },
      danger: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200',
        light: 'bg-red-50',
      },
      gold: {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        border: 'border-amber-200',
        light: 'bg-amber-50',
      },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your admin portal</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-600">System Status:</span>
          <span className={`text-sm font-medium ${emergencyStatus.isActive ? 'text-red-600' : 'text-green-600'}`}>
            {emergencyStatus.isActive ? '🚨 Emergency Active' : '✅ Normal'}
          </span>
        </div>
      </div>

      {/* Emergency Status Banner (when active) */}
      {emergencyStatus.isActive && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-red-900">Emergency Mode Active</h3>
                <p className="text-red-700 mt-1">
                  Type: <strong>{emergencyStatus.type?.toUpperCase()}</strong> | 
                  Activated by: {emergencyStatus.activatedBy}
                </p>
                <div className="mt-3 flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-red-600">In Buildings:</span>
                    <span className="font-semibold text-red-900 ml-1">{evacuationStats.usersInBuildings}</span>
                  </div>
                  <div>
                    <span className="text-green-600">In Safe Zones:</span>
                    <span className="font-semibold text-green-900 ml-1">{evacuationStats.usersInSafeZones}</span>
                  </div>
                  <div>
                    <span className="text-amber-600">En Route:</span>
                    <span className="font-semibold text-amber-900 ml-1">{evacuationStats.usersEnRoute}</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-red-700">Evacuation Progress</span>
                    <span className="font-semibold text-red-900">{evacuationStats.evacuationProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${evacuationStats.evacuationProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Link
              to="/emergency"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Manage Emergency
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <span
                  className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'increase'
                      ? 'bg-green-50 text-green-700'
                      : stat.changeType === 'alert'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {stat.changeType === 'increase' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                  {stat.changeType === 'decrease' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const colorClasses = getColorClasses(action.color);
            return (
              <Link
                key={index}
                to={action.path}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover block relative"
              >
                {action.badge && (
                  <span className={`absolute top-4 right-4 px-2 py-1 ${colorClasses.bg} ${colorClasses.text} text-xs font-semibold rounded-full`}>
                    {action.badge}
                  </span>
                )}
                <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <action.icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & System Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent SOS Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent SOS Alerts</h2>
            <Link to="/sos-alerts" className="text-sm text-red-600 hover:text-red-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {mockSOSAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.status === 'active'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{alert.studentName}</p>
                    <p className="text-sm text-gray-500">{alert.location}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.time).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.status === 'active'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {alert.status === 'active' ? 'Active' : 'Resolved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-gray-700">Avg. Response Time</span>
              </div>
              <span className="font-semibold text-gray-900">{mockAnalyticsData.responseTimeAverage}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-gray-700">Evacuation Success Rate</span>
              </div>
              <span className="font-semibold text-green-600">{mockAnalyticsData.evacuationSuccessRate}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
                <span className="text-gray-700">Emergency Drills (This Month)</span>
              </div>
              <span className="font-semibold text-gray-900">{mockAnalyticsData.emergencyHistory.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-gray-700">App Version</span>
              </div>
              <span className="font-semibold text-gray-900">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
