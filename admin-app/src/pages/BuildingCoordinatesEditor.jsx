import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import {
  MapPin,
  Plus,
  Save,
  Trash2,
  Edit2,
  X,
  Check,
  Building,
  Target,
  Move,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Loader2,
  ChevronDown,
  ChevronUp,
  Navigation,
  Map as MapIcon,
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
} from 'lucide-react';

// BulSU Main Campus Center
const BULSU_CENTER = {
  lat: 14.8524,
  lng: 120.8147,
};

// Default buildings data (matches mobile app)
const defaultBuildings = [
  {
    id: 1,
    name: 'Pimentel Hall',
    coordinates: { latitude: 14.85205, longitude: 120.81505 },
    offices: ['Office of the President', 'Registrar Office', 'Clinic'],
    description: 'Main administrative building of Bulacan State University',
    evacuationArea: 'Front Grounds',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 2,
    name: 'Roxas Hall',
    coordinates: { latitude: 14.85285, longitude: 120.81420 },
    offices: ['College of Engineering', 'Engineering Dean Office'],
    description: 'Home of the College of Engineering',
    evacuationArea: 'Engineering Grounds',
    floorCount: 4,
    type: 'building',
  },
  {
    id: 3,
    name: 'Alvarado Hall',
    coordinates: { latitude: 14.85245, longitude: 120.81480 },
    offices: ['College of Education', 'Education Dean Office'],
    description: 'College of Education building',
    evacuationArea: 'Activity Center',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 4,
    name: 'Natividad Hall',
    coordinates: { latitude: 14.85180, longitude: 120.81530 },
    offices: ['College of Nursing', 'Nursing Skills Lab'],
    description: 'College of Nursing building',
    evacuationArea: 'Front Grounds',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 5,
    name: 'Carpio Hall',
    coordinates: { latitude: 14.85320, longitude: 120.81450 },
    offices: ['College of Business Administration', 'CBA Dean Office'],
    description: 'College of Business Administration',
    evacuationArea: 'Rizal Monument Area',
    floorCount: 4,
    type: 'building',
  },
  {
    id: 6,
    name: 'Federizo Hall',
    coordinates: { latitude: 14.85260, longitude: 120.81380 },
    offices: ['College of Science', 'CS Dean Office', 'College of Architecture and Fine Arts', 'College of Arts and Letters'],
    description: 'Multi-college building housing Science, Architecture, and Arts programs',
    evacuationArea: 'Front Grounds',
    floorCount: 4,
    type: 'building',
  },
  {
    id: 7,
    name: 'CHTM Building',
    coordinates: { latitude: 14.85355, longitude: 120.81490 },
    offices: ['College of Hospitality and Tourism Management', 'CHTM Kitchen Lab'],
    description: 'College of Hospitality and Tourism Management',
    evacuationArea: 'CHTM Grounds',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 8,
    name: 'CBA Building',
    coordinates: { latitude: 14.85150, longitude: 120.81460 },
    offices: ['Accounting Department', 'Marketing Department'],
    description: 'Additional CBA facilities',
    evacuationArea: 'Activity Center',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 9,
    name: 'Flores Hall',
    coordinates: { latitude: 14.85120, longitude: 120.81400 },
    offices: ['College of Information and Communications Technology', 'ICT Dean Office', 'Computer Labs'],
    description: 'College of ICT main building',
    evacuationArea: 'ICT Grounds',
    floorCount: 4,
    type: 'building',
  },
  {
    id: 10,
    name: 'Valencia Hall',
    coordinates: { latitude: 14.85100, longitude: 120.81480 },
    offices: ['Graduate School', 'Research Office'],
    description: 'Graduate School building',
    evacuationArea: 'Valencia Grounds',
    floorCount: 3,
    type: 'building',
  },
  {
    id: 11,
    name: 'Athletes Building',
    coordinates: { latitude: 14.85390, longitude: 120.81350 },
    offices: ['Physical Education Department', 'Sports Office', 'Gym'],
    description: 'Sports and athletics facilities',
    evacuationArea: 'Athletic Field',
    floorCount: 2,
    type: 'building',
  },
  {
    id: 12,
    name: 'Marcelo H. del Pilar College of Law Building',
    coordinates: { latitude: 14.85230, longitude: 120.81550 },
    offices: ['College of Law', 'Moot Court'],
    description: 'College of Law building',
    evacuationArea: 'Law Grounds',
    floorCount: 3,
    type: 'building',
  },
];

// Default evacuation areas
const defaultEvacuationAreas = [
  {
    id: 101,
    name: 'Front Grounds (Main Entrance)',
    coordinates: { latitude: 14.85180, longitude: 120.81520 },
    capacity: 500,
    isMain: true,
    type: 'evacuation',
  },
  {
    id: 102,
    name: 'Activity Center',
    coordinates: { latitude: 14.85220, longitude: 120.81450 },
    capacity: 300,
    isMain: false,
    type: 'evacuation',
  },
  {
    id: 103,
    name: 'Rizal Monument Area',
    coordinates: { latitude: 14.85300, longitude: 120.81480 },
    capacity: 200,
    isMain: false,
    type: 'evacuation',
  },
  {
    id: 104,
    name: 'Athletic Field',
    coordinates: { latitude: 14.85400, longitude: 120.81320 },
    capacity: 1000,
    isMain: true,
    type: 'evacuation',
  },
];

const BuildingCoordinatesEditor = () => {
  const { logAuditTrail } = useAuth();
  const mapContainerRef = useRef(null);
  
  const [buildings, setBuildings] = useState(defaultBuildings);
  const [evacuationAreas, setEvacuationAreas] = useState(defaultEvacuationAreas);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'coordinates', 'details', null
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('building'); // 'building' or 'evacuation'
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [mapCenter, setMapCenter] = useState(BULSU_CENTER);
  const [mapZoom, setMapZoom] = useState(18);
  const [draggedMarker, setDraggedMarker] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offices: '',
    evacuationArea: '',
    floorCount: 3,
    capacity: 500,
    isMain: false,
  });

  const [tempCoordinates, setTempCoordinates] = useState({
    latitude: '',
    longitude: '',
  });

  // Fetch data from server on mount
  useEffect(() => {
    fetchDataFromServer();
  }, []);

  // Check server connection and fetch data
  const fetchDataFromServer = async () => {
    setIsSyncing(true);
    try {
      const health = await apiService.healthCheck();
      if (health.status === 'ok') {
        setIsConnected(true);
        
        // Fetch campus data
        const campusData = await apiService.getCampusData();
        if (campusData.buildings && campusData.buildings.length > 0) {
          setBuildings(campusData.buildings.map(b => ({ ...b, type: 'building' })));
        }
        if (campusData.evacuationAreas && campusData.evacuationAreas.length > 0) {
          setEvacuationAreas(campusData.evacuationAreas.map(e => ({ ...e, type: 'evacuation' })));
        }
        setLastSynced(new Date());
        console.log('✅ Data synced from server');
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to connect to server:', error);
      setIsConnected(false);
    }
    setIsSyncing(false);
  };

  // Sync data to server
  const syncToServer = async () => {
    setIsSyncing(true);
    try {
      await apiService.updateCampusData({
        buildings: buildings.map(({ type, ...rest }) => rest),
        evacuationAreas: evacuationAreas.map(({ type, ...rest }) => rest),
        mapConfig: {
          initialRegion: {
            latitude: BULSU_CENTER.lat,
            longitude: BULSU_CENTER.lng,
            latitudeDelta: 0.004,
            longitudeDelta: 0.004,
          },
          bulsuBounds: {
            north: 14.8545,
            south: 14.8500,
            east: 120.8170,
            west: 120.8125,
          },
        },
      });
      setLastSynced(new Date());
      setIsConnected(true);
      logAuditTrail('DATA_SYNC', 'Synced campus data to server');
      alert('✅ Data synced to server successfully! Mobile app will receive updates.');
    } catch (error) {
      console.error('Failed to sync to server:', error);
      alert('❌ Failed to sync to server. Please check if the backend is running.');
      setIsConnected(false);
    }
    setIsSyncing(false);
  };

  // Handle selecting an item from the list
  const handleSelectItem = (item, type) => {
    setSelectedItem({ ...item, itemType: type });
    setTempCoordinates({
      latitude: item.coordinates.latitude.toString(),
      longitude: item.coordinates.longitude.toString(),
    });
    setEditMode(null);
    
    // Center map on selected item
    setMapCenter({
      lat: item.coordinates.latitude,
      lng: item.coordinates.longitude,
    });
  };

  // Start editing coordinates
  const startEditingCoordinates = () => {
    setEditMode('coordinates');
  };

  // Save coordinate changes
  const saveCoordinates = async () => {
    if (!selectedItem) return;
    
    const newLat = parseFloat(tempCoordinates.latitude);
    const newLng = parseFloat(tempCoordinates.longitude);
    
    if (isNaN(newLat) || isNaN(newLng)) {
      alert('Please enter valid coordinates');
      return;
    }

    if (selectedItem.itemType === 'building') {
      setBuildings(buildings.map(b => 
        b.id === selectedItem.id 
          ? { ...b, coordinates: { latitude: newLat, longitude: newLng } }
          : b
      ));
      
      // Sync to server if connected
      if (isConnected) {
        try {
          await apiService.updateBuildingCoordinates(selectedItem.id, newLat, newLng);
        } catch (error) {
          console.error('Failed to sync coordinate update:', error);
        }
      }
    } else {
      const updatedArea = { ...selectedItem, coordinates: { latitude: newLat, longitude: newLng } };
      setEvacuationAreas(evacuationAreas.map(e => 
        e.id === selectedItem.id ? updatedArea : e
      ));
      
      // Sync to server if connected
      if (isConnected) {
        try {
          await apiService.updateEvacuationArea(selectedItem.id, {
            ...selectedItem,
            coordinates: { latitude: newLat, longitude: newLng }
          });
        } catch (error) {
          console.error('Failed to sync evacuation area update:', error);
        }
      }
    }

    logAuditTrail('COORDINATES_UPDATE', `Updated coordinates for ${selectedItem.name}`);
    setSelectedItem({ ...selectedItem, coordinates: { latitude: newLat, longitude: newLng } });
    setEditMode(null);
  };

  // Delete item
  const handleDelete = async (item, type) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    if (type === 'building') {
      setBuildings(buildings.filter(b => b.id !== item.id));
      
      // Sync to server if connected
      if (isConnected) {
        try {
          await apiService.deleteBuilding(item.id);
        } catch (error) {
          console.error('Failed to sync building deletion:', error);
        }
      }
    } else {
      setEvacuationAreas(evacuationAreas.filter(e => e.id !== item.id));
      
      // Sync to server if connected
      if (isConnected) {
        try {
          await apiService.deleteEvacuationArea(item.id);
        } catch (error) {
          console.error('Failed to sync evacuation area deletion:', error);
        }
      }
    }

    logAuditTrail(`${type.toUpperCase()}_DELETE`, `Deleted ${item.name}`);
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
  };

  // Add new item
  const handleAddNew = async () => {
    setIsLoading(true);
    
    const newItem = addType === 'building' ? {
      id: Date.now(),
      name: formData.name,
      coordinates: { 
        latitude: parseFloat(tempCoordinates.latitude) || BULSU_CENTER.lat, 
        longitude: parseFloat(tempCoordinates.longitude) || BULSU_CENTER.lng 
      },
      offices: formData.offices.split(',').map(o => o.trim()).filter(o => o),
      description: formData.description,
      evacuationArea: formData.evacuationArea,
      floorCount: parseInt(formData.floorCount) || 3,
      type: 'building',
    } : {
      id: Date.now(),
      name: formData.name,
      coordinates: { 
        latitude: parseFloat(tempCoordinates.latitude) || BULSU_CENTER.lat, 
        longitude: parseFloat(tempCoordinates.longitude) || BULSU_CENTER.lng 
      },
      capacity: parseInt(formData.capacity) || 500,
      isMain: formData.isMain,
      type: 'evacuation',
    };

    if (addType === 'building') {
      setBuildings([...buildings, newItem]);
      
      // Sync to server if connected
      if (isConnected) {
        try {
          const { type, ...buildingData } = newItem;
          await apiService.addBuilding(buildingData);
        } catch (error) {
          console.error('Failed to sync new building:', error);
        }
      }
    } else {
      setEvacuationAreas([...evacuationAreas, newItem]);
      
      // Sync to server if connected
      if (isConnected) {
        try {
          const { type, ...areaData } = newItem;
          await apiService.addEvacuationArea(areaData);
        } catch (error) {
          console.error('Failed to sync new evacuation area:', error);
        }
      }
    }

    logAuditTrail(`${addType.toUpperCase()}_ADD`, `Added new ${addType}: ${formData.name}`);
    
    setShowAddModal(false);
    resetForm();
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      offices: '',
      evacuationArea: '',
      floorCount: 3,
      capacity: 500,
      isMain: false,
    });
    setTempCoordinates({
      latitude: BULSU_CENTER.lat.toString(),
      longitude: BULSU_CENTER.lng.toString(),
    });
  };

  // Export data as JSON for mobile app
  const exportData = () => {
    const exportObject = {
      buildings: buildings.map(b => ({
        id: b.id,
        name: b.name,
        coordinates: b.coordinates,
        distance: 0,
        image: null,
        offices: b.offices,
        description: b.description,
        evacuationArea: b.evacuationArea,
        floorCount: b.floorCount,
      })),
      evacuationAreas: evacuationAreas.map(e => ({
        id: e.id,
        name: e.name,
        coordinates: e.coordinates,
        capacity: e.capacity,
        isMain: e.isMain,
      })),
      mapConfig: {
        initialRegion: {
          latitude: BULSU_CENTER.lat,
          longitude: BULSU_CENTER.lng,
          latitudeDelta: 0.004,
          longitudeDelta: 0.004,
        },
        bulsuBounds: {
          north: 14.8545,
          south: 14.8500,
          east: 120.8170,
          west: 120.8125,
        },
      },
      exportedAt: new Date().toISOString(),
      exportedBy: 'ARound BulSU Admin',
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = `bulsu_campus_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    logAuditTrail('DATA_EXPORT', 'Exported campus coordinates data');
  };

  // Copy coordinates to clipboard
  const copyCoordinatesToClipboard = (item) => {
    const coordText = `${item.coordinates.latitude}, ${item.coordinates.longitude}`;
    navigator.clipboard.writeText(coordText);
    alert(`Copied: ${coordText}`);
  };

  // Generate code for mobile app
  const generateMobileAppCode = () => {
    let code = `// BulSU Main Campus Buildings Data
// Updated: ${new Date().toISOString()}
// Coordinates based on BulSU Main Campus, Malolos, Bulacan

export const buildings = [
`;
    
    buildings.forEach((b, i) => {
      code += `  {
    id: ${b.id},
    name: '${b.name}',
    coordinates: { latitude: ${b.coordinates.latitude}, longitude: ${b.coordinates.longitude} },
    distance: 0,
    image: null,
    offices: [${b.offices.map(o => `'${o}'`).join(', ')}],
    description: '${b.description}',
    evacuationArea: '${b.evacuationArea}',
    floorCount: ${b.floorCount},
  },
`;
    });
    
    code += `];

export const evacuationAreas = [
`;
    
    evacuationAreas.forEach((e, i) => {
      code += `  {
    id: ${e.id},
    name: '${e.name}',
    coordinates: { latitude: ${e.coordinates.latitude}, longitude: ${e.coordinates.longitude} },
    capacity: ${e.capacity},
    isMain: ${e.isMain},
  },
`;
    });
    
    code += `];`;
    
    return code;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Building Coordinates Editor</h1>
          <p className="text-gray-500 mt-1">Edit and manage exact coordinates of campus buildings and evacuation areas</p>
        </div>
        <div className="flex space-x-3">
          {/* Sync Status */}
          <div className={`px-3 py-2 rounded-lg flex items-center ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isConnected ? (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Offline</span>
              </>
            )}
          </div>
          
          {/* Sync Button */}
          <button
            onClick={syncToServer}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync to Mobile App'}
          </button>
          
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
          <button
            onClick={() => {
              setAddType('building');
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Building
          </button>
        </div>
      </div>

      {/* Server Connection Banner */}
      {!isConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 text-amber-600 mr-3" />
            <div>
              <h3 className="font-semibold text-amber-900">Backend Server Not Connected</h3>
              <p className="text-sm text-amber-700 mt-1">
                Changes will be saved locally. To sync with the mobile app, start the backend server:
                <code className="ml-2 px-2 py-0.5 bg-amber-100 rounded text-xs">cd backend && npm start</code>
              </p>
            </div>
            <button
              onClick={fetchDataFromServer}
              className="ml-auto px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Last Synced Info */}
      {isConnected && lastSynced && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-green-700">
                Connected to server. Last synced: {lastSynced.toLocaleTimeString()}
              </span>
            </div>
            <span className="text-xs text-green-600">Mobile app will automatically receive updates</span>
          </div>
        </div>
      )}

      {/* Instructions Banner */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">How to Edit Coordinates</h3>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Select a building or evacuation area from the list below</li>
                  <li>Click "Edit Coordinates" to modify the latitude and longitude</li>
                  <li>Use Google Maps to find exact coordinates: Right-click on a location → "What's here?"</li>
                  <li>Copy the coordinates and paste them here</li>
                  <li>Click "Sync to Mobile App" to push changes to the mobile application</li>
                </ol>
              </div>
            </div>
            <button onClick={() => setShowInstructions(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buildings List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Buildings Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-red-600 mr-2" />
                  <h2 className="font-semibold text-gray-900">Campus Buildings ({buildings.length})</h2>
                </div>
                <button
                  onClick={() => {
                    setAddType('building');
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  + Add Building
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  onClick={() => handleSelectItem(building, 'building')}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === building.id && selectedItem?.itemType === 'building' 
                      ? 'bg-red-50 border-l-4 border-red-600' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-red-600 mr-2" />
                        <h3 className="font-medium text-gray-900">{building.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {building.coordinates.latitude.toFixed(5)}, {building.coordinates.longitude.toFixed(5)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 ml-6">{building.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCoordinatesToClipboard(building);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy coordinates"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(building, 'building');
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evacuation Areas Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="font-semibold text-gray-900">Evacuation Areas ({evacuationAreas.length})</h2>
                </div>
                <button
                  onClick={() => {
                    setAddType('evacuation');
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Add Area
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {evacuationAreas.map((area) => (
                <div
                  key={area.id}
                  onClick={() => handleSelectItem(area, 'evacuation')}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedItem?.id === area.id && selectedItem?.itemType === 'evacuation' 
                      ? 'bg-green-50 border-l-4 border-green-600' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Target className="w-4 h-4 text-green-600 mr-2" />
                        <h3 className="font-medium text-gray-900">{area.name}</h3>
                        {area.isMain && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Main
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        {area.coordinates.latitude.toFixed(5)}, {area.coordinates.longitude.toFixed(5)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 ml-6">Capacity: {area.capacity} people</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCoordinatesToClipboard(area);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy coordinates"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(area, 'evacuation');
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Item Editor */}
        <div className="space-y-4">
          {selectedItem ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`p-4 border-b ${selectedItem.itemType === 'building' ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Edit Location</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900 font-medium">{selectedItem.name}</p>
                </div>

                {/* Coordinates Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                    {editMode !== 'coordinates' && (
                      <button
                        onClick={startEditingCoordinates}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editMode === 'coordinates' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                        <input
                          type="text"
                          value={tempCoordinates.latitude}
                          onChange={(e) => setTempCoordinates({ ...tempCoordinates, latitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                          placeholder="14.85205"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                        <input
                          type="text"
                          value={tempCoordinates.longitude}
                          onChange={(e) => setTempCoordinates({ ...tempCoordinates, longitude: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                          placeholder="120.81505"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditMode(null)}
                          className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveCoordinates}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Lat:</span>
                        <span className="font-mono text-gray-900">{selectedItem.coordinates.latitude.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-500">Lng:</span>
                        <span className="font-mono text-gray-900">{selectedItem.coordinates.longitude.toFixed(5)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Link */}
                <div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedItem.coordinates.latitude},${selectedItem.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center"
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    View in Google Maps
                  </a>
                </div>

                {/* Additional Info */}
                {selectedItem.itemType === 'building' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-sm text-gray-600">{selectedItem.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Offices/Departments</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.offices?.map((office, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {office}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floors</label>
                        <p className="text-sm text-gray-600">{selectedItem.floorCount}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evacuation Area</label>
                        <p className="text-sm text-gray-600">{selectedItem.evacuationArea}</p>
                      </div>
                    </div>
                  </>
                )}

                {selectedItem.itemType === 'evacuation' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <p className="text-sm text-gray-600">{selectedItem.capacity} people</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <p className="text-sm text-gray-600">{selectedItem.isMain ? 'Main Area' : 'Secondary'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700">Select a Location</h3>
              <p className="text-sm text-gray-500 mt-1">Click on a building or evacuation area to edit its coordinates</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <Building className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-600">{buildings.length}</p>
                <p className="text-xs text-gray-600">Buildings</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <Target className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{evacuationAreas.length}</p>
                <p className="text-xs text-gray-600">Evac. Areas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className={`p-4 border-b ${addType === 'building' ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  Add New {addType === 'building' ? 'Building' : 'Evacuation Area'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder={addType === 'building' ? 'e.g., New Academic Building' : 'e.g., New Evacuation Point'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={tempCoordinates.latitude}
                    onChange={(e) => setTempCoordinates({ ...tempCoordinates, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="14.8524"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={tempCoordinates.longitude}
                    onChange={(e) => setTempCoordinates({ ...tempCoordinates, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="120.8147"
                  />
                </div>
              </div>

              {addType === 'building' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                      rows={2}
                      placeholder="Brief description of the building"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offices/Departments</label>
                    <input
                      type="text"
                      value={formData.offices}
                      onChange={(e) => setFormData({ ...formData, offices: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="Comma separated: Office 1, Office 2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floor Count</label>
                      <input
                        type="number"
                        value={formData.floorCount}
                        onChange={(e) => setFormData({ ...formData, floorCount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Evacuation Area</label>
                      <input
                        type="text"
                        value={formData.evacuationArea}
                        onChange={(e) => setFormData({ ...formData, evacuationArea: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Front Grounds"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (people)</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      min="1"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isMain"
                      checked={formData.isMain}
                      onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="isMain" className="ml-2 text-sm text-gray-700">
                      This is a main evacuation area
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNew}
                disabled={!formData.name}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="p-4 border-b bg-green-50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Export Coordinates Data</h2>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Export the current building coordinates and evacuation areas. You can use this data to update the mobile app.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                  {generateMobileAppCode()}
                </pre>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateMobileAppCode());
                    alert('Code copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </button>
                <button
                  onClick={() => {
                    exportData();
                    setShowExportModal(false);
                  }}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingCoordinatesEditor;
