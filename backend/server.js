const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'campus_data.json');
const EMERGENCY_FILE = path.join(__dirname, 'data', 'emergency_status.json');
const CAMPUS_NODES_FILE = path.join(__dirname, 'data', 'campus_nodes.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// Default campus data (BulSU Main Campus)
const defaultCampusData = {
  buildings: [
    {
      id: 1,
      name: 'Pimentel Hall',
      coordinates: { latitude: 14.85205, longitude: 120.81505 },
      distance: 0,
      image: null,
      offices: ['Office of the President', 'Registrar Office', 'Clinic'],
      description: 'Main administrative building of Bulacan State University',
      evacuationArea: 'Front Grounds',
      floorCount: 3,
    },
    {
      id: 2,
      name: 'Roxas Hall',
      coordinates: { latitude: 14.85285, longitude: 120.81420 },
      distance: 0,
      image: null,
      offices: ['College of Engineering', 'Engineering Dean Office'],
      description: 'Home of the College of Engineering',
      evacuationArea: 'Engineering Grounds',
      floorCount: 4,
    },
    {
      id: 3,
      name: 'Alvarado Hall',
      coordinates: { latitude: 14.85245, longitude: 120.81480 },
      distance: 0,
      image: null,
      offices: ['College of Education', 'Education Dean Office'],
      description: 'College of Education building',
      evacuationArea: 'Activity Center',
      floorCount: 3,
    },
    {
      id: 4,
      name: 'Natividad Hall',
      coordinates: { latitude: 14.85180, longitude: 120.81530 },
      distance: 0,
      image: null,
      offices: ['College of Nursing', 'Nursing Skills Lab'],
      description: 'College of Nursing building',
      evacuationArea: 'Front Grounds',
      floorCount: 3,
    },
    {
      id: 5,
      name: 'Carpio Hall',
      coordinates: { latitude: 14.85320, longitude: 120.81450 },
      distance: 0,
      image: null,
      offices: ['College of Business Administration', 'CBA Dean Office'],
      description: 'College of Business Administration',
      evacuationArea: 'Rizal Monument Area',
      floorCount: 4,
    },
    {
      id: 6,
      name: 'Federizo Hall',
      coordinates: { latitude: 14.85260, longitude: 120.81380 },
      distance: 0,
      image: null,
      offices: ['College of Science', 'CS Dean Office', 'College of Architecture and Fine Arts', 'College of Arts and Letters'],
      description: 'Multi-college building housing Science, Architecture, and Arts programs',
      evacuationArea: 'Front Grounds',
      floorCount: 4,
    },
    {
      id: 7,
      name: 'CHTM Building',
      coordinates: { latitude: 14.85355, longitude: 120.81490 },
      distance: 0,
      image: null,
      offices: ['College of Hospitality and Tourism Management', 'CHTM Kitchen Lab'],
      description: 'College of Hospitality and Tourism Management',
      evacuationArea: 'CHTM Grounds',
      floorCount: 3,
    },
    {
      id: 8,
      name: 'CBA Building',
      coordinates: { latitude: 14.85150, longitude: 120.81460 },
      distance: 0,
      image: null,
      offices: ['Accounting Department', 'Marketing Department'],
      description: 'Additional CBA facilities',
      evacuationArea: 'Activity Center',
      floorCount: 3,
    },
    {
      id: 9,
      name: 'Flores Hall',
      coordinates: { latitude: 14.85120, longitude: 120.81400 },
      distance: 0,
      image: null,
      offices: ['College of Information and Communications Technology', 'ICT Dean Office', 'Computer Labs'],
      description: 'College of ICT main building',
      evacuationArea: 'ICT Grounds',
      floorCount: 4,
    },
    {
      id: 10,
      name: 'Valencia Hall',
      coordinates: { latitude: 14.85100, longitude: 120.81480 },
      distance: 0,
      image: null,
      offices: ['Graduate School', 'Research Office'],
      description: 'Graduate School building',
      evacuationArea: 'Valencia Grounds',
      floorCount: 3,
    },
    {
      id: 11,
      name: 'Athletes Building',
      coordinates: { latitude: 14.85390, longitude: 120.81350 },
      distance: 0,
      image: null,
      offices: ['Physical Education Department', 'Sports Office', 'Gym'],
      description: 'Sports and athletics facilities',
      evacuationArea: 'Athletic Field',
      floorCount: 2,
    },
    {
      id: 12,
      name: 'Marcelo H. del Pilar College of Law Building',
      coordinates: { latitude: 14.85230, longitude: 120.81550 },
      distance: 0,
      image: null,
      offices: ['College of Law', 'Moot Court'],
      description: 'College of Law building',
      evacuationArea: 'Law Grounds',
      floorCount: 3,
    },
  ],
  evacuationAreas: [
    {
      id: 101,
      name: 'Front Grounds (Main Entrance)',
      coordinates: { latitude: 14.85180, longitude: 120.81520 },
      capacity: 500,
      isMain: true,
    },
    {
      id: 102,
      name: 'Activity Center',
      coordinates: { latitude: 14.85220, longitude: 120.81450 },
      capacity: 300,
      isMain: false,
    },
    {
      id: 103,
      name: 'Rizal Monument Area',
      coordinates: { latitude: 14.85300, longitude: 120.81480 },
      capacity: 200,
      isMain: false,
    },
    {
      id: 104,
      name: 'Athletic Field',
      coordinates: { latitude: 14.85400, longitude: 120.81320 },
      capacity: 1000,
      isMain: true,
    },
  ],
  mapConfig: {
    initialRegion: {
      latitude: 14.85240,
      longitude: 120.81470,
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
  lastUpdated: new Date().toISOString(),
};

// Default emergency status
const defaultEmergencyStatus = {
  isActive: false,
  type: null,
  title: null,
  message: null,
  evacuationAreas: [],
  activatedAt: null,
  activatedBy: null,
  lastUpdated: new Date().toISOString(),
};

// Initialize data files if they don't exist
const initializeDataFiles = () => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultCampusData, null, 2));
    console.log('✅ Created default campus data file');
  }
  if (!fs.existsSync(EMERGENCY_FILE)) {
    fs.writeFileSync(EMERGENCY_FILE, JSON.stringify(defaultEmergencyStatus, null, 2));
    console.log('✅ Created default emergency status file');
  }
};

// Helper functions to read/write data
const readCampusData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading campus data:', error);
    return defaultCampusData;
  }
};

const writeCampusData = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing campus data:', error);
    return false;
  }
};

const readEmergencyStatus = () => {
  try {
    const data = fs.readFileSync(EMERGENCY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading emergency status:', error);
    return defaultEmergencyStatus;
  }
};

const writeEmergencyStatus = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(EMERGENCY_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing emergency status:', error);
    return false;
  }
};

// Initialize data files
initializeDataFiles();

// ==================== API ROUTES ====================

// Health check at root
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ARound BulSU Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Health check at API path
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ARound BulSU Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== CAMPUS DATA ROUTES ====================

// Get all campus data (buildings, evacuation areas, map config)
app.get('/api/campus', (req, res) => {
  const data = readCampusData();
  res.json(data);
});

// Get buildings only
app.get('/api/buildings', (req, res) => {
  const data = readCampusData();
  res.json(data.buildings);
});

// Get a specific building by ID
app.get('/api/buildings/:id', (req, res) => {
  const data = readCampusData();
  const building = data.buildings.find(b => b.id === parseInt(req.params.id));
  if (building) {
    res.json(building);
  } else {
    res.status(404).json({ error: 'Building not found' });
  }
});

// Add a new building
app.post('/api/buildings', (req, res) => {
  const data = readCampusData();
  const newBuilding = {
    id: Date.now(),
    ...req.body,
  };
  data.buildings.push(newBuilding);
  
  if (writeCampusData(data)) {
    console.log(`✅ Added new building: ${newBuilding.name}`);
    res.status(201).json(newBuilding);
  } else {
    res.status(500).json({ error: 'Failed to save building' });
  }
});

// Update a building
app.put('/api/buildings/:id', (req, res) => {
  const data = readCampusData();
  const index = data.buildings.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Building not found' });
  }
  
  data.buildings[index] = { ...data.buildings[index], ...req.body };
  
  if (writeCampusData(data)) {
    console.log(`✅ Updated building: ${data.buildings[index].name}`);
    res.json(data.buildings[index]);
  } else {
    res.status(500).json({ error: 'Failed to update building' });
  }
});

// Update building coordinates only
app.patch('/api/buildings/:id/coordinates', (req, res) => {
  const data = readCampusData();
  const index = data.buildings.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Building not found' });
  }
  
  const { latitude, longitude } = req.body;
  data.buildings[index].coordinates = { latitude, longitude };
  
  if (writeCampusData(data)) {
    console.log(`✅ Updated coordinates for: ${data.buildings[index].name}`);
    res.json(data.buildings[index]);
  } else {
    res.status(500).json({ error: 'Failed to update coordinates' });
  }
});

// Delete a building
app.delete('/api/buildings/:id', (req, res) => {
  const data = readCampusData();
  const index = data.buildings.findIndex(b => b.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Building not found' });
  }
  
  const deletedBuilding = data.buildings.splice(index, 1)[0];
  
  if (writeCampusData(data)) {
    console.log(`✅ Deleted building: ${deletedBuilding.name}`);
    res.json({ message: 'Building deleted', building: deletedBuilding });
  } else {
    res.status(500).json({ error: 'Failed to delete building' });
  }
});

// ==================== EVACUATION AREAS ROUTES ====================

// Get evacuation areas only
app.get('/api/evacuation-areas', (req, res) => {
  const data = readCampusData();
  res.json(data.evacuationAreas);
});

// Add a new evacuation area
app.post('/api/evacuation-areas', (req, res) => {
  const data = readCampusData();
  const newArea = {
    id: Date.now(),
    ...req.body,
  };
  data.evacuationAreas.push(newArea);
  
  if (writeCampusData(data)) {
    console.log(`✅ Added new evacuation area: ${newArea.name}`);
    res.status(201).json(newArea);
  } else {
    res.status(500).json({ error: 'Failed to save evacuation area' });
  }
});

// Update an evacuation area
app.put('/api/evacuation-areas/:id', (req, res) => {
  const data = readCampusData();
  const index = data.evacuationAreas.findIndex(e => e.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Evacuation area not found' });
  }
  
  data.evacuationAreas[index] = { ...data.evacuationAreas[index], ...req.body };
  
  if (writeCampusData(data)) {
    console.log(`✅ Updated evacuation area: ${data.evacuationAreas[index].name}`);
    res.json(data.evacuationAreas[index]);
  } else {
    res.status(500).json({ error: 'Failed to update evacuation area' });
  }
});

// Delete an evacuation area
app.delete('/api/evacuation-areas/:id', (req, res) => {
  const data = readCampusData();
  const index = data.evacuationAreas.findIndex(e => e.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Evacuation area not found' });
  }
  
  const deletedArea = data.evacuationAreas.splice(index, 1)[0];
  
  if (writeCampusData(data)) {
    console.log(`✅ Deleted evacuation area: ${deletedArea.name}`);
    res.json({ message: 'Evacuation area deleted', area: deletedArea });
  } else {
    res.status(500).json({ error: 'Failed to delete evacuation area' });
  }
});

// ==================== EMERGENCY STATUS ROUTES ====================

// Get current emergency status
app.get('/api/emergency', (req, res) => {
  const status = readEmergencyStatus();
  res.json(status);
});

// Activate emergency
app.post('/api/emergency/activate', (req, res) => {
  const { type, title, message, evacuationAreas, activatedBy } = req.body;
  
  const status = {
    isActive: true,
    type: type || 'general',
    title: title || 'Emergency Alert',
    message: message || 'Please follow evacuation procedures',
    evacuationAreas: evacuationAreas || [],
    activatedAt: new Date().toISOString(),
    activatedBy: activatedBy || 'Admin',
    lastUpdated: new Date().toISOString(),
  };
  
  if (writeEmergencyStatus(status)) {
    console.log(`🚨 EMERGENCY ACTIVATED: ${status.type} by ${status.activatedBy}`);
    res.json(status);
  } else {
    res.status(500).json({ error: 'Failed to activate emergency' });
  }
});

// Deactivate emergency
app.post('/api/emergency/deactivate', (req, res) => {
  const { deactivatedBy } = req.body;
  
  const status = {
    isActive: false,
    type: null,
    title: null,
    message: null,
    evacuationAreas: [],
    activatedAt: null,
    activatedBy: null,
    deactivatedAt: new Date().toISOString(),
    deactivatedBy: deactivatedBy || 'Admin',
    lastUpdated: new Date().toISOString(),
  };
  
  if (writeEmergencyStatus(status)) {
    console.log(`✅ Emergency deactivated by ${deactivatedBy}`);
    res.json(status);
  } else {
    res.status(500).json({ error: 'Failed to deactivate emergency' });
  }
});

// ==================== BULK UPDATE ROUTES ====================

// Update all campus data (from admin export)
app.put('/api/campus', (req, res) => {
  const { buildings, evacuationAreas, mapConfig } = req.body;
  
  const data = {
    buildings: buildings || [],
    evacuationAreas: evacuationAreas || [],
    mapConfig: mapConfig || defaultCampusData.mapConfig,
    lastUpdated: new Date().toISOString(),
  };
  
  if (writeCampusData(data)) {
    console.log(`✅ Campus data updated: ${buildings?.length || 0} buildings, ${evacuationAreas?.length || 0} evacuation areas`);
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to update campus data' });
  }
});

// ==================== DATA VERSION/SYNC ROUTES ====================

// Get last update timestamps (for sync checking)
app.get('/api/sync/status', (req, res) => {
  const campusData = readCampusData();
  const emergencyStatus = readEmergencyStatus();
  
  res.json({
    campusDataLastUpdated: campusData.lastUpdated,
    emergencyStatusLastUpdated: emergencyStatus.lastUpdated,
    serverTime: new Date().toISOString(),
  });
});

// ==================== CAMPUS NODES ROUTES (A* & Dijkstra) ====================

// Default campus nodes for pathfinding
const defaultCampusNodes = {
  nodes: {
    main_gate: {
      id: 'main_gate',
      name: 'Main Gate (MacArthur Highway)',
      coordinates: { latitude: 14.8535, longitude: 120.8160 },
      type: 'gate',
      isEntrance: true
    },
    back_gate: {
      id: 'back_gate',
      name: 'Back Gate',
      coordinates: { latitude: 14.8510, longitude: 120.8140 },
      type: 'gate',
      isEntrance: true
    },
    intersection_1: {
      id: 'intersection_1',
      name: 'Main Junction',
      coordinates: { latitude: 14.8527, longitude: 120.8157 },
      type: 'intersection'
    },
    cit_building: {
      id: 'cit_building',
      name: 'College of Information Technology',
      coordinates: { latitude: 14.8530, longitude: 120.8165 },
      type: 'building_entrance',
      buildingId: 'cit'
    },
    evac_field: {
      id: 'evac_field',
      name: 'University Field (Evacuation)',
      coordinates: { latitude: 14.8520, longitude: 120.8142 },
      type: 'evacuation',
      isEvacuationPoint: true,
      capacity: 2000
    },
  },
  connections: {
    main_gate: ['intersection_1'],
    back_gate: ['evac_field'],
    intersection_1: ['main_gate', 'cit_building', 'evac_field'],
    cit_building: ['intersection_1'],
    evac_field: ['intersection_1', 'back_gate'],
  },
  lastUpdated: new Date().toISOString()
};

// Read campus nodes
const readCampusNodes = () => {
  try {
    if (!fs.existsSync(CAMPUS_NODES_FILE)) {
      fs.writeFileSync(CAMPUS_NODES_FILE, JSON.stringify(defaultCampusNodes, null, 2));
      return defaultCampusNodes;
    }
    const data = fs.readFileSync(CAMPUS_NODES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading campus nodes:', error);
    return defaultCampusNodes;
  }
};

// Write campus nodes
const writeCampusNodes = (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CAMPUS_NODES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing campus nodes:', error);
    return false;
  }
};

// Get all campus nodes
app.get('/api/campus-nodes', (req, res) => {
  const data = readCampusNodes();
  res.json(data);
});

// Save/update campus nodes
app.post('/api/campus-nodes', (req, res) => {
  const { nodes, connections } = req.body;
  
  const data = {
    nodes: nodes || {},
    connections: connections || {},
    lastUpdated: new Date().toISOString()
  };
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Campus nodes updated: ${Object.keys(nodes || {}).length} nodes, ${Object.keys(connections || {}).length} connections`);
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to save campus nodes' });
  }
});

// Add a single node
app.post('/api/campus-nodes/node', (req, res) => {
  const data = readCampusNodes();
  const newNode = req.body;
  
  if (!newNode.id) {
    return res.status(400).json({ error: 'Node ID is required' });
  }
  
  data.nodes[newNode.id] = newNode;
  if (!data.connections[newNode.id]) {
    data.connections[newNode.id] = [];
  }
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Added node: ${newNode.name || newNode.id}`);
    res.status(201).json(newNode);
  } else {
    res.status(500).json({ error: 'Failed to add node' });
  }
});

// Update a single node
app.put('/api/campus-nodes/node/:id', (req, res) => {
  const data = readCampusNodes();
  const nodeId = req.params.id;
  
  if (!data.nodes[nodeId]) {
    return res.status(404).json({ error: 'Node not found' });
  }
  
  data.nodes[nodeId] = { ...data.nodes[nodeId], ...req.body };
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Updated node: ${nodeId}`);
    res.json(data.nodes[nodeId]);
  } else {
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// Delete a single node
app.delete('/api/campus-nodes/node/:id', (req, res) => {
  const data = readCampusNodes();
  const nodeId = req.params.id;
  
  if (!data.nodes[nodeId]) {
    return res.status(404).json({ error: 'Node not found' });
  }
  
  // Remove node
  delete data.nodes[nodeId];
  
  // Remove all connections to/from this node
  delete data.connections[nodeId];
  Object.keys(data.connections).forEach(key => {
    data.connections[key] = data.connections[key].filter(id => id !== nodeId);
  });
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Deleted node: ${nodeId}`);
    res.json({ success: true, deletedId: nodeId });
  } else {
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// Add a connection between nodes
app.post('/api/campus-nodes/connection', (req, res) => {
  const { fromId, toId, bidirectional = true } = req.body;
  const data = readCampusNodes();
  
  if (!data.nodes[fromId] || !data.nodes[toId]) {
    return res.status(404).json({ error: 'One or both nodes not found' });
  }
  
  if (!data.connections[fromId]) data.connections[fromId] = [];
  if (!data.connections[fromId].includes(toId)) {
    data.connections[fromId].push(toId);
  }
  
  if (bidirectional) {
    if (!data.connections[toId]) data.connections[toId] = [];
    if (!data.connections[toId].includes(fromId)) {
      data.connections[toId].push(fromId);
    }
  }
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Connected: ${fromId} <-> ${toId}`);
    res.json({ success: true, fromId, toId, bidirectional });
  } else {
    res.status(500).json({ error: 'Failed to add connection' });
  }
});

// Remove a connection between nodes
app.delete('/api/campus-nodes/connection', (req, res) => {
  const { fromId, toId, bidirectional = true } = req.body;
  const data = readCampusNodes();
  
  if (data.connections[fromId]) {
    data.connections[fromId] = data.connections[fromId].filter(id => id !== toId);
  }
  
  if (bidirectional && data.connections[toId]) {
    data.connections[toId] = data.connections[toId].filter(id => id !== fromId);
  }
  
  if (writeCampusNodes(data)) {
    console.log(`✅ Disconnected: ${fromId} <-> ${toId}`);
    res.json({ success: true, fromId, toId });
  } else {
    res.status(500).json({ error: 'Failed to remove connection' });
  }
});

// Generate JavaScript code for mobile app
app.get('/api/campus-nodes/generate-code', (req, res) => {
  const data = readCampusNodes();
  
  let code = `// Campus Graph Data - Generated ${new Date().toISOString()}\n`;
  code += `// Auto-generated by ARound BulSU Admin Panel\n\n`;
  code += `export const campusNodes = {\n`;
  
  Object.values(data.nodes).forEach(node => {
    code += `  ${node.id}: {\n`;
    code += `    id: '${node.id}',\n`;
    code += `    name: '${node.name}',\n`;
    code += `    coordinates: { latitude: ${node.coordinates.latitude}, longitude: ${node.coordinates.longitude} },\n`;
    code += `    type: '${node.type}',\n`;
    if (node.isEvacuationPoint) code += `    isEvacuationPoint: true,\n`;
    if (node.isEntrance) code += `    isEntrance: true,\n`;
    if (node.buildingId) code += `    buildingId: '${node.buildingId}',\n`;
    if (node.capacity) code += `    capacity: ${node.capacity},\n`;
    code += `  },\n`;
  });
  
  code += `};\n\n`;
  code += `export const campusGraph = {\n`;
  
  Object.entries(data.connections).forEach(([nodeId, conns]) => {
    code += `  ${nodeId}: [${conns.map(c => `'${c}'`).join(', ')}],\n`;
  });
  
  code += `};\n`;
  
  res.type('text/javascript').send(code);
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         ARound BulSU Backend Server                          ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on http://localhost:${PORT}                  ║`);
  console.log('║                                                              ║');
  console.log('║  API Endpoints:                                              ║');
  console.log('║  • GET  /api/health               - Health check             ║');
  console.log('║  • GET  /api/campus               - All campus data          ║');
  console.log('║  • GET  /api/buildings            - All buildings            ║');
  console.log('║  • GET  /api/evacuation-areas     - Evacuation areas         ║');
  console.log('║  • GET  /api/emergency            - Emergency status         ║');
  console.log('║  • POST /api/emergency/activate   - Activate alert           ║');
  console.log('║  • POST /api/emergency/deactivate - Deactivate alert         ║');
  console.log('║  • GET  /api/campus-nodes         - Get pathfinding nodes    ║');
  console.log('║  • POST /api/campus-nodes         - Save pathfinding nodes   ║');
  console.log('║  • GET  /api/campus-nodes/generate-code - Generate JS code   ║');
  console.log('║  • GET  /api/sync/status          - Sync timestamps          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
});
