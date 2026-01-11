import { useState } from 'react';
import { mockSOSAlerts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  User,
  Check,
  X,
  Eye,
  Map,
  PhoneCall,
  Loader2,
  RefreshCw,
  Filter,
} from 'lucide-react';

const SOSAlerts = () => {
  const [alerts, setAlerts] = useState(mockSOSAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const { user, logAuditTrail } = useAuth();

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const filteredAlerts = statusFilter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === statusFilter);

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const handleResolveClick = (alert) => {
    setSelectedAlert(alert);
    setShowResolveModal(true);
  };

  const handleResolve = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setAlerts(alerts.map(alert => 
      alert.id === selectedAlert.id 
        ? { 
            ...alert, 
            status: 'resolved', 
            resolvedAt: new Date().toISOString(),
            resolvedBy: user?.name,
            resolutionNote: resolutionNote,
          } 
        : alert
    ));

    logAuditTrail('SOS_RESOLVE', `Resolved SOS alert from ${selectedAlert.studentName}`);
    
    setShowResolveModal(false);
    setShowDetailModal(false);
    setSelectedAlert(null);
    setResolutionNote('');
    setIsLoading(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getTypeColor = (type) => {
    const colors = {
      'Medical Emergency': 'bg-red-100 text-red-700 border-red-200',
      'Safety Concern': 'bg-orange-100 text-orange-700 border-orange-200',
      'Accident': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Vehicle Issue': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SOS Alerts</h1>
          <p className="text-gray-500 mt-1">Monitor and respond to student emergency alerts</p>
        </div>
        <button
          onClick={() => setAlerts([...alerts])}
          className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg flex items-center hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-5 ${activeAlerts.length > 0 ? 'bg-red-50 border-2 border-red-200' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className={`text-3xl font-bold ${activeAlerts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {activeAlerts.length}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeAlerts.length > 0 ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
              <Bell className={`w-6 h-6 ${activeAlerts.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
          {activeAlerts.length > 0 && (
            <p className="text-sm text-red-600 mt-2 font-medium">⚠️ Requires immediate attention</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved Today</p>
              <p className="text-3xl font-bold text-green-600">{resolvedAlerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* No Active Alerts Message */}
      {activeAlerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-800">No Active Alerts</h3>
          <p className="text-green-600 mt-1">All emergency alerts have been resolved. System is monitoring for new alerts.</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="w-5 h-5 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Alerts</option>
          <option value="active">Active Only</option>
          <option value="resolved">Resolved Only</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xl border-2 p-5 transition-all ${
              alert.status === 'active' 
                ? 'border-red-300 shadow-md' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  alert.status === 'active' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <User className={`w-6 h-6 ${alert.status === 'active' ? 'text-red-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{alert.studentName}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      alert.status === 'active' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {alert.status === 'active' ? '🔴 Active' : '✅ Resolved'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Student ID: {alert.studentId}</p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {alert.location}
                    </span>
                    <span className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(alert.time)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(alert.type)}`}>
                      {alert.type}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3">{alert.description}</p>

                  {alert.status === 'resolved' && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>Resolved by:</strong> {alert.resolvedBy} at {new Date(alert.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleViewAlert(alert)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                
                {alert.status === 'active' && (
                  <>
                    <a
                      href={`tel:${alert.phone}`}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 mr-1" />
                      Call
                    </a>
                    <button
                      onClick={() => handleResolveClick(alert)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No alerts found matching your filter</p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className={`p-6 ${selectedAlert.status === 'active' ? 'bg-red-600' : 'bg-green-600'} text-white rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">SOS Alert Details</h3>
                    <p className="text-white/80">{selectedAlert.type}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedAlert.studentName}</h4>
                  <p className="text-gray-500">Student ID: {selectedAlert.studentId}</p>
                  <p className="text-gray-500">{selectedAlert.phone}</p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-gray-900 font-semibold">{selectedAlert.location}</p>
                <p className="text-sm text-gray-500 mt-1">
                  GPS: {selectedAlert.coordinates.lat}, {selectedAlert.coordinates.lng}
                </p>
                
                {/* Mock Map */}
                <div className="mt-3 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Map View</p>
                    <p className="text-xs text-gray-400">Location pin would appear here</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Alert Description</h5>
                <p className="text-gray-600">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Alert Time</p>
                  <p className="font-medium">{new Date(selectedAlert.time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`font-medium ${selectedAlert.status === 'active' ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedAlert.status === 'active' ? '🔴 Active' : '✅ Resolved'}
                  </p>
                </div>
              </div>

              {selectedAlert.status === 'resolved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Resolved by:</strong> {selectedAlert.resolvedBy}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Resolved at:</strong> {new Date(selectedAlert.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedAlert.status === 'active' && (
                <div className="flex space-x-3 pt-4 border-t">
                  <a
                    href={`tel:${selectedAlert.phone}`}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
                  >
                    <PhoneCall className="w-5 h-5 mr-2" />
                    Contact Student
                  </a>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleResolveClick(selectedAlert);
                    }}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResolveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Resolve Alert?</h3>
              <p className="text-gray-500 text-center mb-6">
                Confirm resolution of SOS alert from <strong>{selectedAlert.studentName}</strong>
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Note (Optional)</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Add notes about how the alert was resolved..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-700">
                  This will:
                </p>
                <ul className="text-sm text-amber-600 mt-1 list-disc list-inside">
                  <li>Mark the alert as resolved</li>
                  <li>Send "Case Resolved" notification to student</li>
                  <li>Log resolution to audit trail</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setResolutionNote('');
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Resolution
                    </>
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

export default SOSAlerts;
