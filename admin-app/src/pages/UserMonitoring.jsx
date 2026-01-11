import { useState } from 'react';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  X,
  ChevronDown,
  Award,
  Navigation,
  Calendar,
  Mail,
  Clock,
  Loader2,
  MoreVertical,
} from 'lucide-react';

const UserMonitoring = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { logAuditTrail } = useAuth();

  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const disabledUsers = users.filter(u => u.status === 'disabled').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleStatusClick = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, status: newStatus } : u
    ));

    logAuditTrail(
      newStatus === 'disabled' ? 'USER_DISABLE' : 'USER_ENABLE',
      `${newStatus === 'disabled' ? 'Disabled' : 'Enabled'} account for ${selectedUser.name}`
    );

    setShowStatusModal(false);
    setSelectedUser(null);
    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-amber-100 text-amber-700',
      disabled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusDot = (status) => {
    const colors = {
      active: 'bg-green-500',
      inactive: 'bg-amber-500',
      disabled: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastActive = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Monitoring</h1>
          <p className="text-gray-500 mt-1">Monitor and manage registered app users</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-3xl font-bold text-amber-600">{inactiveUsers}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disabled</p>
              <p className="text-3xl font-bold text-red-600">{disabledUsers}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or student ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP / Badges</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.studentId}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDot(user.status)}`}></span>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{formatLastActive(user.lastActive)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{user.xp} XP</span>
                      <span className="flex items-center text-sm text-amber-600">
                        <Award className="w-4 h-4 mr-1" />
                        {user.badges}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusClick(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === 'disabled' 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={user.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
                      >
                        {user.status === 'disabled' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-red-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                    <p className="text-red-100">{selectedUser.studentId}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(selectedUser.status)}`}></span>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </span>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleStatusClick(selectedUser);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    selectedUser.status === 'disabled'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {selectedUser.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
                </button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Registration Date</span>
                  </div>
                  <p className="font-medium text-gray-900">{formatDate(selectedUser.registrationDate)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Last Active</span>
                  </div>
                  <p className="font-medium text-gray-900">{formatLastActive(selectedUser.lastActive)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    <span className="text-sm">Total Navigations</span>
                  </div>
                  <p className="font-medium text-gray-900">{selectedUser.navigations}</p>
                </div>
              </div>

              {/* Gamification Stats */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Gamification Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">{selectedUser.xp}</p>
                    <p className="text-sm text-red-700">Experience Points</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">{selectedUser.badges}</p>
                    <p className="text-sm text-amber-700">Badges Earned</p>
                  </div>
                </div>
              </div>

              {/* Activity Log Placeholder */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {[
                    { action: 'Navigated to Science Building', time: '2 hours ago' },
                    { action: 'Completed campus tour badge', time: '1 day ago' },
                    { action: 'Used AR navigation feature', time: '2 days ago' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">{activity.action}</span>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                selectedUser.status === 'disabled' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {selectedUser.status === 'disabled' 
                  ? <UserCheck className="w-8 h-8 text-green-600" />
                  : <UserX className="w-8 h-8 text-red-600" />
                }
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {selectedUser.status === 'disabled' ? 'Enable Account?' : 'Disable Account?'}
              </h3>
              <p className="text-gray-500 text-center mb-6">
                {selectedUser.status === 'disabled' 
                  ? `Enable account access for ${selectedUser.name}?`
                  : `Disable account access for ${selectedUser.name}? They will not be able to use the app.`
                }
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(selectedUser.status === 'disabled' ? 'active' : 'disabled')}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 font-medium rounded-lg disabled:opacity-50 flex items-center justify-center ${
                    selectedUser.status === 'disabled'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    selectedUser.status === 'disabled' ? 'Enable' : 'Disable'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMonitoring;
