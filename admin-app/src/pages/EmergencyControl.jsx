import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import {
  AlertTriangle,
  Flame,
  Mountain,
  CloudRain,
  Shield,
  HeartPulse,
  AlertCircle,
  X,
  Check,
  Users,
  MapPin,
  Clock,
  Radio,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

const EmergencyControl = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [affectedAreas, setAffectedAreas] = useState('all');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, logAuditTrail } = useAuth();
  const { emergencyStatus, evacuationStats, activateEmergency, deactivateEmergency } = useEmergency();

  const emergencyTypes = [
    { id: 'fire', label: 'Fire', icon: Flame, color: 'red', description: 'Building fire or fire hazard' },
    { id: 'earthquake', label: 'Earthquake', icon: Mountain, color: 'orange', description: 'Seismic activity detected' },
    { id: 'typhoon', label: 'Typhoon', icon: CloudRain, color: 'blue', description: 'Severe weather warning' },
    { id: 'threat', label: 'Security Threat', icon: Shield, color: 'purple', description: 'Security breach or threat' },
    { id: 'health', label: 'Health Emergency', icon: HeartPulse, color: 'pink', description: 'Medical or health crisis' },
    { id: 'other', label: 'Other', icon: AlertCircle, color: 'gray', description: 'Other emergency situation' },
  ];

  const getTypeColor = (type) => {
    const colors = {
      fire: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200',
      earthquake: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200',
      typhoon: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200',
      threat: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200',
      health: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200',
      other: 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
    };
    return colors[type] || colors.other;
  };

  const getSelectedColor = (type) => {
    const colors = {
      fire: 'bg-red-500 text-white border-red-500',
      earthquake: 'bg-orange-500 text-white border-orange-500',
      typhoon: 'bg-blue-500 text-white border-blue-500',
      threat: 'bg-purple-500 text-white border-purple-500',
      health: 'bg-pink-500 text-white border-pink-500',
      other: 'bg-gray-500 text-white border-gray-500',
    };
    return colors[type] || colors.other;
  };

  const handleActivate = async () => {
    if (adminPin !== '123456') {
      setError('Invalid Admin PIN. Use 123456 for demo.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await activateEmergency(selectedType, customMessage, affectedAreas, user?.name);
      logAuditTrail('EMERGENCY_ACTIVATE', `Activated ${selectedType?.toUpperCase()} emergency for ${affectedAreas}`);
      setShowActivateModal(false);
      setAdminPin('');
      setSelectedType(null);
      setCustomMessage('');
    } catch (err) {
      setError('Failed to activate emergency mode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (adminPin !== '123456') {
      setError('Invalid Admin PIN. Use 123456 for demo.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await deactivateEmergency();
      logAuditTrail('EMERGENCY_DEACTIVATE', `Deactivated emergency - ${result.summary?.usersEvacuated} users evacuated`);
      setShowDeactivateModal(false);
      setAdminPin('');
    } catch (err) {
      setError('Failed to deactivate emergency mode');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    if (!emergencyStatus.activatedAt) return '0 min';
    const start = new Date(emergencyStatus.activatedAt);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}m ${diffSecs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Control</h1>
          <p className="text-gray-500 mt-1">Manage campus-wide emergency alerts and evacuation</p>
        </div>
      </div>

      {/* Current Status Card */}
      <div className={`rounded-xl p-6 ${emergencyStatus.isActive ? 'bg-red-50 border-2 border-red-300' : 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${emergencyStatus.isActive ? 'bg-red-500 animate-pulse' : 'bg-green-500'} mr-3`}></div>
            <h2 className="text-lg font-semibold">
              Current Status: {emergencyStatus.isActive ? (
                <span className="text-red-600">🚨 EMERGENCY ACTIVE</span>
              ) : (
                <span className="text-green-600">✅ NORMAL</span>
              )}
            </h2>
          </div>
          {emergencyStatus.isActive && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              {emergencyStatus.type?.toUpperCase()}
            </span>
          )}
        </div>

        {emergencyStatus.isActive ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-red-600 mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{calculateDuration()}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-red-600 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">In Buildings</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{evacuationStats.usersInBuildings}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center text-green-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">In Safe Zones</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{evacuationStats.usersInSafeZones}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-center text-amber-600 mb-2">
                  <Radio className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">En Route</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{evacuationStats.usersEnRoute}</p>
              </div>
            </div>

            {/* Evacuation Progress */}
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Evacuation Progress</span>
                <span className="text-lg font-bold text-amber-600">{evacuationStats.evacuationProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${evacuationStats.evacuationProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Activated by <strong>{emergencyStatus.activatedBy}</strong> at {new Date(emergencyStatus.activatedAt).toLocaleString()}
              </p>
            </div>

            {/* Deactivate Button */}
            <button
              onClick={() => setShowDeactivateModal(true)}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              <Check className="w-5 h-5 mr-2" />
              DEACTIVATE EMERGENCY - Send All Clear
            </button>
          </div>
        ) : (
          <p className="text-gray-500">No active emergencies. All systems operating normally.</p>
        )}
      </div>

      {/* Activate Emergency Section (only show when not active) */}
      {!emergencyStatus.isActive && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activate Emergency Mode</h2>
          
          {/* Emergency Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Emergency Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {emergencyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedType === type.id 
                      ? getSelectedColor(type.id)
                      : getTypeColor(type.id)
                  }`}
                >
                  <type.icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium text-sm">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter a custom emergency message to send to all users..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              rows={3}
            />
          </div>

          {/* Affected Areas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Areas</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="all"
                  checked={affectedAreas === 'all'}
                  onChange={(e) => setAffectedAreas(e.target.value)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="ml-2 text-gray-700">All Campus</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="specific"
                  checked={affectedAreas === 'specific'}
                  onChange={(e) => setAffectedAreas(e.target.value)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="ml-2 text-gray-700">Specific Buildings</span>
              </label>
            </div>
          </div>

          {/* Activate Button */}
          <button
            onClick={() => setShowActivateModal(true)}
            disabled={!selectedType}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            🚨 ACTIVATE EMERGENCY MODE 🚨
          </button>
        </div>
      )}

      {/* Activate Confirmation Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowActivateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-red-600 p-6 text-white">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">⚠️ CONFIRM EMERGENCY ACTIVATION</h3>
                  <p className="text-red-100">This action will alert all users</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">You are about to activate:</p>
                <p className="text-red-900 text-lg font-bold">
                  {emergencyTypes.find(t => t.id === selectedType)?.label?.toUpperCase()} EMERGENCY
                </p>
                <p className="text-red-700 text-sm mt-1">for {affectedAreas === 'all' ? 'ALL CAMPUS' : 'SPECIFIC BUILDINGS'}</p>
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Send push notifications to ALL users</li>
                  <li>Switch all apps to evacuation mode</li>
                  <li>Guide users to nearest safe zones</li>
                  <li>Log this action with timestamp</li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin PIN Required
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 6-digit PIN (use 123456 for demo)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowActivateModal(false);
                    setAdminPin('');
                    setError('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActivate}
                  disabled={isLoading || adminPin.length !== 6}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'CONFIRM & ACTIVATE'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeactivateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-green-600 p-6 text-white">
              <div className="flex items-center">
                <Check className="w-8 h-8 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">✅ CONFIRM EMERGENCY DEACTIVATION</h3>
                  <p className="text-green-100">Send "All Clear" to all users</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-2">Evacuation Summary:</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Duration:</span>
                    <span className="font-bold text-green-900 ml-2">{calculateDuration()}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Users Evacuated:</span>
                    <span className="font-bold text-green-900 ml-2">{evacuationStats.usersInSafeZones}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Marked Safe:</span>
                    <span className="font-bold text-green-900 ml-2">{evacuationStats.usersInSafeZones}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Progress:</span>
                    <span className="font-bold text-green-900 ml-2">{evacuationStats.evacuationProgress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Send "All Clear" notification to all users</li>
                  <li>Return all apps to normal mode</li>
                  <li>Log evacuation statistics</li>
                  <li>Generate emergency report</li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin PIN Required
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Enter 6-digit PIN (use 123456 for demo)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeactivateModal(false);
                    setAdminPin('');
                    setError('');
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeactivate}
                  disabled={isLoading || adminPin.length !== 6}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'CONFIRM & DEACTIVATE'
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

export default EmergencyControl;
