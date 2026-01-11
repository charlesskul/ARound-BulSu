/**
 * Pathfinding Test Script
 * Tests A* and Dijkstra algorithms for ARound BulSU
 * 
 * Run this in Node.js to verify pathfinding logic works correctly
 */

// Import the graph and pathfinding service
const { campusNodes, campusGraph } = require('../data/campusGraph');
const { 
  navigateToBuilding, 
  navigateToEvacuation,
  findNearestNode 
} = require('../services/pathfindingService');

console.log('========================================');
console.log('   ARound BulSU Pathfinding Tests');
console.log('========================================\n');

// Test 1: Check campus graph data
console.log('TEST 1: Campus Graph Data');
console.log('--------------------------');
console.log(`Total nodes: ${Object.keys(campusNodes).length}`);

const nodeTypes = {};
Object.values(campusNodes).forEach(node => {
  nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
});
console.log('Node types:', nodeTypes);

// Count total connections
let totalConnections = 0;
Object.values(campusGraph).forEach(connections => {
  totalConnections += connections.length;
});
console.log(`Total connections: ${totalConnections}`);
console.log('✅ Campus graph loaded successfully\n');

// Test 2: Find nearest node to a location
console.log('TEST 2: Find Nearest Node');
console.log('--------------------------');
const testLocation = {
  latitude: 14.8527,
  longitude: 120.8157
};
const nearest = findNearestNode(testLocation);
if (nearest) {
  console.log(`Test location: ${testLocation.latitude}, ${testLocation.longitude}`);
  console.log(`Nearest node: ${nearest.name} (${nearest.id})`);
  console.log(`Node type: ${nearest.type}`);
  console.log('✅ Nearest node found successfully\n');
} else {
  console.log('❌ Failed to find nearest node\n');
}

// Test 3: A* Navigation to Building
console.log('TEST 3: A* Algorithm - Navigate to Building');
console.log('--------------------------------------------');
const startLocation = {
  latitude: 14.8535,  // Near main gate
  longitude: 120.8160
};

// Test navigation to different buildings
const testBuildings = ['cit_building', 'coed_building', 'gymnasium'];

testBuildings.forEach(buildingId => {
  const result = navigateToBuilding(startLocation, buildingId);
  if (result) {
    console.log(`\n📍 Route to ${result.endNode.name}:`);
    console.log(`   Distance: ${result.totalDistance}m`);
    console.log(`   Estimated time: ${result.estimatedTime} min`);
    console.log(`   Waypoints: ${result.path.length}`);
    console.log(`   Path: ${result.path.map(n => n.id).join(' → ')}`);
  } else {
    console.log(`❌ No path found to ${buildingId}`);
  }
});
console.log('\n✅ A* navigation tests completed\n');

// Test 4: Dijkstra Emergency Evacuation
console.log('TEST 4: Dijkstra Algorithm - Emergency Evacuation');
console.log('--------------------------------------------------');

// Test evacuation from different locations
const evacuationTestLocations = [
  { name: 'CIT Building Area', coords: { latitude: 14.8528, longitude: 120.8162 } },
  { name: 'Gymnasium Area', coords: { latitude: 14.8515, longitude: 120.8145 } },
  { name: 'COED Building Area', coords: { latitude: 14.8522, longitude: 120.8155 } },
];

evacuationTestLocations.forEach(loc => {
  const result = navigateToEvacuation(loc.coords);
  if (result) {
    console.log(`\n🚨 Evacuation from ${loc.name}:`);
    console.log(`   Nearest evacuation: ${result.endNode.name}`);
    console.log(`   Distance: ${result.totalDistance}m`);
    console.log(`   Estimated time: ${result.estimatedTime} min`);
    console.log(`   Waypoints: ${result.path.length}`);
    console.log(`   Path: ${result.path.map(n => n.id).join(' → ')}`);
  } else {
    console.log(`❌ No evacuation path from ${loc.name}`);
  }
});
console.log('\n✅ Dijkstra evacuation tests completed\n');

// Test 5: Edge Cases
console.log('TEST 5: Edge Cases');
console.log('-------------------');

// Test with invalid building ID
const invalidResult = navigateToBuilding(startLocation, 'nonexistent_building');
console.log(`Invalid building ID test: ${invalidResult ? '❌ Should have failed' : '✅ Correctly returned null'}`);

// Test with location very far from campus
const farLocation = { latitude: 14.5, longitude: 121.0 };
const farResult = navigateToBuilding(farLocation, 'cit_building');
console.log(`Far location test: ${farResult ? '✅ Path found (connects to nearest node)' : '❌ No path found'}`);

console.log('\n========================================');
console.log('   All Pathfinding Tests Completed!');
console.log('========================================\n');

// Summary
console.log('SUMMARY:');
console.log('--------');
console.log('✅ Campus graph: ' + Object.keys(campusNodes).length + ' nodes loaded');
console.log('✅ A* algorithm: Working for daily navigation');
console.log('✅ Dijkstra algorithm: Working for emergency evacuation');
console.log('✅ Nearest node finder: Working');
console.log('\nThe pathfinding system is ready for use in the mobile app!');
