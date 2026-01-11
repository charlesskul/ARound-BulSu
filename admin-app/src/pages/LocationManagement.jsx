import { useState } from 'react';
import { mockLocations } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Building,
  DoorOpen,
  Shield,
  Coffee,
  Loader2,
  ChevronDown,
} from 'lucide-react';

const LocationManagement = () => {
  const [locations, setLocations] = useState(mockLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Building',
    building: '',
    floor: '',
    description: '',
    latitude: '',
    longitude: '',
    operatingHours: '',
    capacity: '',
  });

  const { logAuditTrail } = useAuth();

  const categories = ['Building', 'Room', 'Safe Zone', 'Facility', 'Office', 'Laboratory'];

  const getCategoryIcon = (category) => {
    const icons = {
      Building: Building,
      Room: DoorOpen,
      'Safe Zone': Shield,
      Facility: Coffee,
      Office: Building,
      Laboratory: Building,
    };
    return icons[category] || MapPin;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Building: 'bg-red-100 text-red-600',
      Room: 'bg-blue-100 text-blue-600',
      'Safe Zone': 'bg-green-100 text-green-600',
      Facility: 'bg-amber-100 text-amber-600',
      Office: 'bg-purple-100 text-purple-600',
      Laboratory: 'bg-pink-100 text-pink-600',
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || location.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddLocation = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const newLocation = {
      id: Date.now(),
      ...formData,
      status: 'active',
      latitude: parseFloat(formData.latitude) || 14.8527,
      longitude: parseFloat(formData.longitude) || 120.8148,
    };

    setLocations([...locations, newLocation]);
    logAuditTrail('LOCATION_ADD', `Added new location: ${formData.name}`);
    setShowAddModal(false);
    resetForm();
    setIsLoading(false);
  };

  const handleEditLocation = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setLocations(locations.map(loc => 
      loc.id === selectedLocation.id 
        ? { ...loc, ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) }
        : loc
    ));
    logAuditTrail('LOCATION_EDIT', `Updated location: ${formData.name}`);
    setShowEditModal(false);
    setSelectedLocation(null);
    resetForm();
    setIsLoading(false);
  };

  const handleDeleteLocation = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    setLocations(locations.filter(loc => loc.id !== selectedLocation.id));
    logAuditTrail('LOCATION_DELETE', `Deleted location: ${selectedLocation.name}`);
    setShowDeleteModal(false);
    setSelectedLocation(null);
    setIsLoading(false);
  };

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      category: location.category,
      building: location.building || '',
      floor: location.floor || '',
      description: location.description || '',
      latitude: location.latitude?.toString() || '',
      longitude: location.longitude?.toString() || '',
      operatingHours: location.operatingHours || '',
      capacity: location.capacity?.toString() || '',
    });
    setShowEditModal(true);
  };

  const openViewModal = (location) => {
    setSelectedLocation(location);
    setShowViewModal(true);
  };

  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Building',
      building: '',
      floor: '',
      description: '',
      latitude: '',
      longitude: '',
      operatingHours: '',
      capacity: '',
    });
  };

  const LocationForm = ({ onSubmit, submitLabel }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="e.g., Science Building"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Building</label>
          <input
            type="text"
            value={formData.building}
            onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="For rooms only"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
          <input
            type="number"
            value={formData.floor}
            onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="e.g., 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.category === 'Safe Zone' ? 'Capacity' : 'Operating Hours'}
          </label>
          <input
            type="text"
            value={formData.category === 'Safe Zone' ? formData.capacity : formData.operatingHours}
            onChange={(e) => setFormData({ 
              ...formData, 
              [formData.category === 'Safe Zone' ? 'capacity' : 'operatingHours']: e.target.value 
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder={formData.category === 'Safe Zone' ? 'e.g., 2000' : 'e.g., 8:00 AM - 5:00 PM'}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
            rows={2}
            placeholder="Brief description of this location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
          <input
            type="text"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="e.g., 14.8527"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
          <input
            type="text"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="e.g., 120.8148"
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={isLoading || !formData.name}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : submitLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-500 mt-1">Manage campus buildings, rooms, and safe zones</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </button>
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
              placeholder="Search locations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLocations.map((location) => {
          const CategoryIcon = getCategoryIcon(location.category);
          return (
            <div
              key={location.id}
              className="bg-white rounded-xl border border-gray-200 p-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(location.category)}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  location.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {location.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{location.category}</p>
              
              {location.building && (
                <p className="text-xs text-gray-400 mb-1">📍 {location.building}, Floor {location.floor}</p>
              )}
              
              {location.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{location.description}</p>
              )}

              {location.rooms && (
                <p className="text-sm text-gray-500 mb-3">
                  <span className="font-medium">{location.rooms}</span> rooms
                </p>
              )}

              {location.capacity && (
                <p className="text-sm text-gray-500 mb-3">
                  Capacity: <span className="font-medium">{location.capacity}</span>
                </p>
              )}

              <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openViewModal(location)}
                  className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(location)}
                  className="flex-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(location)}
                  className="flex-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No locations found matching your criteria</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Add New Location</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <LocationForm onSubmit={handleAddLocation} submitLabel="Add Location" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Edit Location</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <LocationForm onSubmit={handleEditLocation} submitLabel="Save Changes" />
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowViewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="border-b p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Location Details</h3>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCategoryColor(selectedLocation.category)}`}>
                  {(() => {
                    const Icon = getCategoryIcon(selectedLocation.category);
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedLocation.name}</h4>
                  <p className="text-gray-500">{selectedLocation.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {selectedLocation.building && (
                  <div>
                    <p className="text-sm text-gray-500">Building</p>
                    <p className="font-medium">{selectedLocation.building}</p>
                  </div>
                )}
                {selectedLocation.floor && (
                  <div>
                    <p className="text-sm text-gray-500">Floor</p>
                    <p className="font-medium">{selectedLocation.floor}</p>
                  </div>
                )}
                {selectedLocation.rooms && (
                  <div>
                    <p className="text-sm text-gray-500">Rooms</p>
                    <p className="font-medium">{selectedLocation.rooms}</p>
                  </div>
                )}
                {selectedLocation.capacity && (
                  <div>
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-medium">{selectedLocation.capacity}</p>
                  </div>
                )}
                {selectedLocation.operatingHours && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Operating Hours</p>
                    <p className="font-medium">{selectedLocation.operatingHours}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="font-medium">{selectedLocation.latitude}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="font-medium">{selectedLocation.longitude}</p>
                </div>
              </div>

              {selectedLocation.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{selectedLocation.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Location?</h3>
              <p className="text-gray-500 text-center mb-6">
                Are you sure you want to delete <strong>{selectedLocation.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLocation}
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
