import { useState } from 'react';
import { mockAnalyticsData } from '../data/mockData';
import {
  BarChart3,
  Users,
  Navigation,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
  Download,
  Calendar,
  FileText,
  Loader2,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const Analytics = () => {
  const [selectedReport, setSelectedReport] = useState('navigation');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);

  const data = mockAnalyticsData;

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a simple CSV export
    const csvContent = `ARound BulSU Analytics Report
Generated: ${new Date().toLocaleString()}
Date Range: Last ${dateRange}

SUMMARY
Total Users: ${data.totalUsers}
Active Today: ${data.activeToday}
Total Navigations: ${data.totalNavigations}
SOS Alerts: ${data.sosAlerts}

Response Time Average: ${data.responseTimeAverage}
Evacuation Success Rate: ${data.evacuationSuccessRate}
`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `around-bulsu-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setIsExporting(false);
  };

  const COLORS = ['#dc2626', '#9a7b1f', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">View statistics and generate reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Download className="w-5 h-5 mr-2" />
            )}
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-3xl font-bold text-gray-900">{data.activeToday.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">68% activity rate</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Navigations</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalNavigations.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+23% from last month</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">SOS Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{data.sosAlerts}</p>
              <p className="text-sm text-gray-500 mt-1">All resolved</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'navigation', label: 'Navigation Report', icon: MapPin },
              { id: 'users', label: 'User Report', icon: Users },
              { id: 'emergency', label: 'Emergency Report', icon: AlertTriangle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedReport === tab.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Navigation Report */}
          {selectedReport === 'navigation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Navigation Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Visited Locations */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">Most Visited Locations</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.navigationsByLocation} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="navigations" fill="#dc2626" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Peak Usage Hours */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">Peak Usage Hours</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.peakUsageHours}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#9a7b1f" 
                          fill="#d4c48a" 
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Popular Routes */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-medium text-gray-700 mb-4">Popular Routes</h4>
                <div className="space-y-3">
                  {[
                    { from: 'Main Gate', to: 'Science Building', count: 234 },
                    { from: 'Canteen', to: 'Library', count: 189 },
                    { from: 'Engineering Building', to: 'Gymnasium', count: 156 },
                    { from: 'Administration Building', to: 'Registrar Office', count: 143 },
                    { from: 'Parking Area', to: 'Main Gate', count: 128 },
                  ].map((route, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center">
                        <span className="text-gray-600">{route.from}</span>
                        <span className="mx-3 text-gray-400">→</span>
                        <span className="text-gray-900 font-medium">{route.to}</span>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        {route.count} trips
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Report */}
          {selectedReport === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">User Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">Registration Trends</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#dc2626" 
                          strokeWidth={2}
                          dot={{ fill: '#dc2626', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* User Status Distribution */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">Active vs Inactive Users</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={data.userStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {data.userStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Gamification Statistics */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-medium text-gray-700 mb-4">Gamification Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-red-600">15,680</p>
                    <p className="text-sm text-gray-500 mt-1">Total XP Earned</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-amber-600">52</p>
                    <p className="text-sm text-gray-500 mt-1">Total Badges Awarded</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">89%</p>
                    <p className="text-sm text-gray-500 mt-1">Engagement Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Report */}
          {selectedReport === 'emergency' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SOS Alert History */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">SOS Alert History</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.sosAlertHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="alerts" fill="#ef4444" name="Alerts" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="resolved" fill="#22c55e" name="Resolved" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Response Stats */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-medium text-gray-700 mb-4">Response Statistics</h4>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Average Response Time</span>
                        <span className="text-2xl font-bold text-amber-600">{data.responseTimeAverage}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Evacuation Success Rate</span>
                        <span className="text-2xl font-bold text-green-600">{data.evacuationSuccessRate}</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Drills Conducted</span>
                        <span className="text-2xl font-bold text-red-600">{data.emergencyHistory.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evacuation Records */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-medium text-gray-700 mb-4">Evacuation Records</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Duration</th>
                        <th className="pb-3 font-medium">Users Evacuated</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.emergencyHistory.map((record) => (
                        <tr key={record.id}>
                          <td className="py-3 font-medium text-gray-900">{record.type}</td>
                          <td className="py-3 text-gray-600">{record.date}</td>
                          <td className="py-3 text-gray-600">{record.duration}</td>
                          <td className="py-3 text-gray-600">{record.evacuated.toLocaleString()}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        <p className="text-gray-500 mb-4">Export detailed reports for analysis and documentation.</p>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            Full Report (CSV)
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Navigation Report
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            User Report
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
