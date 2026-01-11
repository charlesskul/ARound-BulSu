// Mock data for ARound BulSU Admin Application

// Users data
export const mockUsers = [
  { id: 1, name: 'Juan Dela Cruz', email: 'juan.delacruz@bulsu.edu.ph', studentId: '2021-00001', status: 'active', lastActive: '2024-12-17T10:30:00', registrationDate: '2024-01-15', xp: 1250, badges: 5, navigations: 127 },
  { id: 2, name: 'Maria Santos', email: 'maria.santos@bulsu.edu.ph', studentId: '2021-00002', status: 'active', lastActive: '2024-12-17T09:45:00', registrationDate: '2024-01-20', xp: 980, badges: 4, navigations: 89 },
  { id: 3, name: 'Pedro Reyes', email: 'pedro.reyes@bulsu.edu.ph', studentId: '2021-00003', status: 'active', lastActive: '2024-12-17T08:15:00', registrationDate: '2024-02-01', xp: 2100, badges: 8, navigations: 234 },
  { id: 4, name: 'Ana Garcia', email: 'ana.garcia@bulsu.edu.ph', studentId: '2021-00004', status: 'inactive', lastActive: '2024-12-10T14:20:00', registrationDate: '2024-02-15', xp: 450, badges: 2, navigations: 45 },
  { id: 5, name: 'Carlos Mendoza', email: 'carlos.mendoza@bulsu.edu.ph', studentId: '2021-00005', status: 'active', lastActive: '2024-12-17T11:00:00', registrationDate: '2024-03-01', xp: 1800, badges: 7, navigations: 198 },
  { id: 6, name: 'Sofia Villanueva', email: 'sofia.villanueva@bulsu.edu.ph', studentId: '2022-00001', status: 'active', lastActive: '2024-12-17T10:00:00', registrationDate: '2024-03-15', xp: 720, badges: 3, navigations: 67 },
  { id: 7, name: 'Miguel Torres', email: 'miguel.torres@bulsu.edu.ph', studentId: '2022-00002', status: 'disabled', lastActive: '2024-11-28T09:30:00', registrationDate: '2024-04-01', xp: 150, badges: 1, navigations: 12 },
  { id: 8, name: 'Isabella Cruz', email: 'isabella.cruz@bulsu.edu.ph', studentId: '2022-00003', status: 'active', lastActive: '2024-12-17T07:45:00', registrationDate: '2024-04-15', xp: 3200, badges: 12, navigations: 345 },
  { id: 9, name: 'Rafael Aquino', email: 'rafael.aquino@bulsu.edu.ph', studentId: '2022-00004', status: 'active', lastActive: '2024-12-16T16:30:00', registrationDate: '2024-05-01', xp: 890, badges: 4, navigations: 78 },
  { id: 10, name: 'Gabriela Lim', email: 'gabriela.lim@bulsu.edu.ph', studentId: '2022-00005', status: 'active', lastActive: '2024-12-17T11:15:00', registrationDate: '2024-05-15', xp: 1560, badges: 6, navigations: 156 },
  { id: 11, name: 'Antonio Fernandez', email: 'antonio.fernandez@bulsu.edu.ph', studentId: '2023-00001', status: 'active', lastActive: '2024-12-17T10:45:00', registrationDate: '2024-08-01', xp: 670, badges: 3, navigations: 54 },
  { id: 12, name: 'Lucia Ramos', email: 'lucia.ramos@bulsu.edu.ph', studentId: '2023-00002', status: 'active', lastActive: '2024-12-17T09:00:00', registrationDate: '2024-08-15', xp: 420, badges: 2, navigations: 38 },
];

// Locations data
export const mockLocations = [
  { id: 1, name: 'Science Building', category: 'Building', building: null, floor: null, rooms: 45, status: 'active', latitude: 14.8527, longitude: 120.8148, description: 'Main science complex with laboratories', operatingHours: '6:00 AM - 9:00 PM' },
  { id: 2, name: 'Administration Building', category: 'Building', building: null, floor: null, rooms: 30, status: 'active', latitude: 14.8530, longitude: 120.8145, description: 'University administrative offices', operatingHours: '8:00 AM - 5:00 PM' },
  { id: 3, name: 'Engineering Building', category: 'Building', building: null, floor: null, rooms: 50, status: 'active', latitude: 14.8525, longitude: 120.8150, description: 'College of Engineering main building', operatingHours: '6:00 AM - 9:00 PM' },
  { id: 4, name: 'Library', category: 'Building', building: null, floor: null, rooms: 10, status: 'active', latitude: 14.8528, longitude: 120.8142, description: 'University library and learning center', operatingHours: '7:00 AM - 8:00 PM' },
  { id: 5, name: 'Gymnasium', category: 'Facility', building: null, floor: null, rooms: 5, status: 'active', latitude: 14.8520, longitude: 120.8155, description: 'Sports and physical education facility', operatingHours: '6:00 AM - 9:00 PM' },
  { id: 6, name: 'Quadrangle', category: 'Safe Zone', building: null, floor: null, rooms: null, status: 'active', latitude: 14.8527, longitude: 120.8147, description: 'Main evacuation assembly area', capacity: 2000 },
  { id: 7, name: 'Covered Court', category: 'Safe Zone', building: null, floor: null, rooms: null, status: 'active', latitude: 14.8522, longitude: 120.8153, description: 'Secondary evacuation area', capacity: 1500 },
  { id: 8, name: 'Room 101', category: 'Room', building: 'Science Building', floor: 1, rooms: null, status: 'active', latitude: 14.8527, longitude: 120.8148, description: 'Chemistry Laboratory 1' },
  { id: 9, name: 'Room 201', category: 'Room', building: 'Science Building', floor: 2, rooms: null, status: 'active', latitude: 14.8527, longitude: 120.8148, description: 'Physics Laboratory 1' },
  { id: 10, name: 'Registrar Office', category: 'Office', building: 'Administration Building', floor: 1, rooms: null, status: 'active', latitude: 14.8530, longitude: 120.8145, description: 'Student registration services', operatingHours: '8:00 AM - 5:00 PM' },
  { id: 11, name: 'Canteen', category: 'Facility', building: null, floor: null, rooms: null, status: 'active', latitude: 14.8524, longitude: 120.8146, description: 'Main student cafeteria', operatingHours: '6:00 AM - 7:00 PM' },
  { id: 12, name: 'Parking Area A', category: 'Safe Zone', building: null, floor: null, rooms: null, status: 'active', latitude: 14.8535, longitude: 120.8140, description: 'Open parking for evacuation', capacity: 500 },
];

// SOS Alerts data
export const mockSOSAlerts = [
  { id: 1, studentName: 'Juan Dela Cruz', studentId: '2021-00001', phone: '+63 912 345 6789', location: 'Science Building, Room 305', coordinates: { lat: 14.8527, lng: 120.8148 }, time: '2024-12-17T10:30:00', status: 'active', type: 'Medical Emergency', description: 'Student feeling dizzy and having difficulty breathing' },
  { id: 2, studentName: 'Maria Santos', studentId: '2021-00002', phone: '+63 917 654 3210', location: 'Engineering Building, Hallway 2F', coordinates: { lat: 14.8525, lng: 120.8150 }, time: '2024-12-17T09:15:00', status: 'active', type: 'Safety Concern', description: 'Suspicious individual spotted near the building' },
  { id: 3, studentName: 'Pedro Reyes', studentId: '2021-00003', phone: '+63 927 111 2222', location: 'Library, 3rd Floor', coordinates: { lat: 14.8528, lng: 120.8142 }, time: '2024-12-17T08:45:00', status: 'resolved', type: 'Accident', description: 'Minor slip accident on wet floor', resolvedAt: '2024-12-17T09:00:00', resolvedBy: 'Security Office' },
  { id: 4, studentName: 'Ana Garcia', studentId: '2021-00004', phone: '+63 935 333 4444', location: 'Gymnasium', coordinates: { lat: 14.8520, lng: 120.8155 }, time: '2024-12-16T14:20:00', status: 'resolved', type: 'Medical Emergency', description: 'Student fainted during PE class', resolvedAt: '2024-12-16T14:45:00', resolvedBy: 'Campus Security' },
  { id: 5, studentName: 'Carlos Mendoza', studentId: '2021-00005', phone: '+63 945 555 6666', location: 'Parking Area A', coordinates: { lat: 14.8535, lng: 120.8140 }, time: '2024-12-15T16:30:00', status: 'resolved', type: 'Vehicle Issue', description: 'Vehicle break-in attempt', resolvedAt: '2024-12-15T17:00:00', resolvedBy: 'Security Office' },
];

// Analytics data
export const mockAnalyticsData = {
  totalUsers: 1245,
  activeToday: 847,
  totalNavigations: 3421,
  sosAlerts: 2,
  
  userGrowth: [
    { month: 'Jul', users: 450 },
    { month: 'Aug', users: 680 },
    { month: 'Sep', users: 820 },
    { month: 'Oct', users: 980 },
    { month: 'Nov', users: 1100 },
    { month: 'Dec', users: 1245 },
  ],
  
  navigationsByLocation: [
    { name: 'Science Building', navigations: 523, percentage: 15.3 },
    { name: 'Engineering Building', navigations: 489, percentage: 14.3 },
    { name: 'Library', navigations: 445, percentage: 13.0 },
    { name: 'Administration Building', navigations: 398, percentage: 11.6 },
    { name: 'Gymnasium', navigations: 356, percentage: 10.4 },
    { name: 'Canteen', navigations: 412, percentage: 12.0 },
    { name: 'Other Locations', navigations: 798, percentage: 23.3 },
  ],
  
  peakUsageHours: [
    { hour: '6AM', users: 45 },
    { hour: '7AM', users: 120 },
    { hour: '8AM', users: 380 },
    { hour: '9AM', users: 520 },
    { hour: '10AM', users: 610 },
    { hour: '11AM', users: 580 },
    { hour: '12PM', users: 450 },
    { hour: '1PM', users: 420 },
    { hour: '2PM', users: 550 },
    { hour: '3PM', users: 590 },
    { hour: '4PM', users: 480 },
    { hour: '5PM', users: 320 },
    { hour: '6PM', users: 180 },
    { hour: '7PM', users: 90 },
    { hour: '8PM', users: 45 },
  ],
  
  userStatus: [
    { status: 'Active', count: 1180, color: '#22c55e' },
    { status: 'Inactive', count: 52, color: '#f59e0b' },
    { status: 'Disabled', count: 13, color: '#ef4444' },
  ],
  
  emergencyHistory: [
    { id: 1, type: 'Fire Drill', date: '2024-12-10', duration: '12 min', evacuated: 1180, status: 'Completed' },
    { id: 2, type: 'Earthquake Drill', date: '2024-11-15', duration: '18 min', evacuated: 1050, status: 'Completed' },
    { id: 3, type: 'Typhoon Alert', date: '2024-10-28', duration: '2 hrs', evacuated: 890, status: 'Completed' },
  ],
  
  sosAlertHistory: [
    { month: 'Jul', alerts: 3, resolved: 3 },
    { month: 'Aug', alerts: 5, resolved: 5 },
    { month: 'Sep', alerts: 2, resolved: 2 },
    { month: 'Oct', alerts: 4, resolved: 4 },
    { month: 'Nov', alerts: 3, resolved: 3 },
    { month: 'Dec', alerts: 5, resolved: 3 },
  ],
  
  responseTimeAverage: '4.5 minutes',
  evacuationSuccessRate: '98.2%',
};

// Audit trail data
export const mockAuditTrail = [
  { id: 1, action: 'LOGIN', description: 'Admin Security Office logged in successfully', timestamp: '2024-12-17T10:30:00', user: 'Security Office' },
  { id: 2, action: 'LOCATION_ADD', description: 'Added new location: Room 305 - Science Building', timestamp: '2024-12-17T10:15:00', user: 'Security Office' },
  { id: 3, action: 'SOS_RESOLVE', description: 'Resolved SOS alert from Pedro Reyes', timestamp: '2024-12-17T09:00:00', user: 'Campus Security' },
  { id: 4, action: 'USER_DISABLE', description: 'Disabled account for Miguel Torres', timestamp: '2024-12-16T15:30:00', user: 'Security Office' },
  { id: 5, action: 'EMERGENCY_DRILL', description: 'Activated Fire Drill for All Campus', timestamp: '2024-12-10T14:00:00', user: 'Security Office' },
  { id: 6, action: 'EMERGENCY_END', description: 'Deactivated Fire Drill - All clear sent', timestamp: '2024-12-10T14:12:00', user: 'Security Office' },
];

export default {
  mockUsers,
  mockLocations,
  mockSOSAlerts,
  mockAnalyticsData,
  mockAuditTrail,
};
