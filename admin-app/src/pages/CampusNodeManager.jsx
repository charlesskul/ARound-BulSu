import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const nodeTypeColors = {
  gate: '#10B981',
  path: '#6B7280',
  intersection: '#F59E0B',
  building_entrance: '#3B82F6',
  evacuation: '#EF4444',
};

const nodeTypeLabels = {
  gate: 'Gate/Entrance',
  path: 'Walkway/Path',
  intersection: 'Intersection',
  building_entrance: 'Building Entrance',
  evacuation: 'Evacuation Area',
};

const CampusNodeManager = () => {
  const [viewState, setViewState] = useState({
    longitude: 120.9403,
    latitude: 14.8413,
    zoom: 17,
    pitch: 0,
    bearing: 0,
  });

  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState('path');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);
  const [mapStyle, setMapStyle] = useState('satellite-streets');
  const mapRef = useRef(null);

  const mapStyles = {
    'satellite-streets': 'mapbox://styles/mapbox/satellite-streets-v12',
    'satellite': 'mapbox://styles/mapbox/satellite-v9',
    'streets': 'mapbox://styles/mapbox/streets-v12',
    'outdoors': 'mapbox://styles/mapbox/outdoors-v12',
  };

  useEffect(() => { loadNodes(); }, []);

  const loadNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/campus-nodes');
      if (response.ok) {
        const data = await response.json();
        // Backend returns { nodes: { id: {...}, ... }, connections: {...} }
        // Normalize to an array of node objects our UI expects
        if (data && data.nodes) {
          // Get the connections map from backend data (connections are stored separately)
          const connectionsMap = data.connections || {};
          
          if (Array.isArray(data.nodes)) {
            // If nodes is already an array, merge connections from connectionsMap
            const nodesWithConnections = data.nodes.map(n => ({
              ...n,
              connections: connectionsMap[n.id] || n.connections || []
            }));
            setNodes(nodesWithConnections);
          } else if (typeof data.nodes === 'object') {
            const arr = Object.values(data.nodes).map(n => {
              // Some nodes may nest coordinates under `coordinates` or use latitude/longitude directly
              const latitude = n.latitude ?? n.coordinates?.latitude ?? n.coordinates?.lat ?? null;
              const longitude = n.longitude ?? n.coordinates?.longitude ?? n.coordinates?.lng ?? n.coordinates?.lon ?? null;
              const nodeId = n.id || n.nodeId || `${n.name || 'node'}_${Math.random().toString(36).slice(2,8)}`;
              return {
                id: nodeId,
                name: n.name || n.label || n.id,
                type: n.type || 'path',
                latitude,
                longitude,
                // CRITICAL FIX: Read connections from the separate connectionsMap, not from node object
                connections: connectionsMap[nodeId] || connectionsMap[n.id] || n.connections || [],
                description: n.description || n.note || ''
              };
            });
            setNodes(arr);
            console.log('Loaded nodes with connections:', arr.filter(n => n.connections.length > 0).length, 'nodes have connections');
          } else {
            setNodes([]);
          }
        } else {
          setNodes([]);
        }
        showStatus('Nodes loaded from server');
      }
    } catch (error) {
      const savedNodes = localStorage.getItem('campusNodes');
      if (savedNodes) {
        setNodes(JSON.parse(savedNodes));
        showStatus('Nodes loaded from local storage');
      }
    }
  };

  useEffect(() => {
    if (nodes.length > 0) localStorage.setItem('campusNodes', JSON.stringify(nodes));
  }, [nodes]);

  const showStatus = (msg) => { setStatusMessage(msg); setTimeout(() => setStatusMessage(''), 3000); };

  const handleMapClick = useCallback((event) => {
    if (!isAddingNode) return;
    const { lng, lat } = event.lngLat;
    const newNode = {
      id: 'node_' + Date.now(),
      name: 'New ' + nodeTypeLabels[newNodeType],
      type: newNodeType,
      latitude: lat,
      longitude: lng,
      connections: [],
      description: '',
    };
    setNodes(prev => [...prev, newNode]);
    setIsAddingNode(false);
    setCursorPosition(null);
    showStatus('Added ' + nodeTypeLabels[newNodeType]);
  }, [isAddingNode, newNodeType]);

  const handleMouseMove = useCallback((event) => {
    if (isAddingNode) setCursorPosition({ lng: event.lngLat.lng, lat: event.lngLat.lat });
  }, [isAddingNode]);

  const handleMarkerClick = useCallback((node, e) => {
    e.originalEvent.stopPropagation();
    if (isConnecting && connectingFrom) {
      if (connectingFrom.id !== node.id) {
        setNodes(prev => prev.map(n => {
          if (n.id === connectingFrom.id && !(n.connections || []).includes(node.id)) {
            return { ...n, connections: [...(n.connections || []), node.id] };
          }
          if (n.id === node.id && !(n.connections || []).includes(connectingFrom.id)) {
            return { ...n, connections: [...(n.connections || []), connectingFrom.id] };
          }
          return n;
        }));
        showStatus('Connected ' + connectingFrom.name + ' to ' + node.name);
      }
      setIsConnecting(false);
      setConnectingFrom(null);
    } else {
      setSelectedNode(node);
    }
  }, [isConnecting, connectingFrom]);

  const startConnecting = (node) => { setIsConnecting(true); setConnectingFrom(node); setSelectedNode(null); };
  const editNode = (node) => { setEditingNode({ ...node }); setShowEditModal(true); setSelectedNode(null); };
  const saveEditedNode = () => { setNodes(prev => prev.map(n => n.id === editingNode.id ? editingNode : n)); setShowEditModal(false); setEditingNode(null); showStatus('Node updated'); };

  const deleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId).map(n => ({ ...n, connections: (n.connections || []).filter(c => c !== nodeId) })));
    setSelectedNode(null);
    showStatus('Node deleted');
  };

  const removeConnection = (fromId, toId) => {
    setNodes(prev => prev.map(n => {
      if (n.id === fromId) return { ...n, connections: (n.connections || []).filter(c => c !== toId) };
      if (n.id === toId) return { ...n, connections: (n.connections || []).filter(c => c !== fromId) };
      return n;
    }));
    showStatus('Connection removed');
  };

  const syncToBackend = async () => {
    try {
      // Convert our nodes array into backend-expected shape: nodes map and connections map
      const nodesMap = {};
      const connectionsMap = {};
      nodes.forEach(n => {
        nodesMap[n.id] = {
          id: n.id,
          name: n.name,
          type: n.type,
          coordinates: { latitude: n.latitude, longitude: n.longitude },
          description: n.description || ''
        };
        connectionsMap[n.id] = n.connections || [];
      });

      const response = await fetch('http://localhost:3001/api/campus-nodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nodes: nodesMap, connections: connectionsMap }) });
      showStatus(response.ok ? 'Synced to backend successfully!' : 'Sync failed');
    } catch (error) { showStatus('Error: ' + error.message); }
  };

  const exportNodes = () => {
    const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'campus_nodes.json'; link.click();
    URL.revokeObjectURL(url);
    showStatus('Exported');
  };

  const generateCode = () => {
    const nodesCode = nodes.map(node => {
      const conns = (node.connections || []).map(c => "'" + c + "'").join(', ');
      const safeName = node.name.replace(/'/g, "\\'");
      const safeDesc = (node.description || '').replace(/'/g, "\\'");
      return "  '" + node.id + "': { id: '" + node.id + "', name: '" + safeName + "', type: '" + node.type + "', latitude: " + node.latitude + ", longitude: " + node.longitude + ", connections: [" + conns + "], description: '" + safeDesc + "' }";
    }).join(',\n');
    const code = "// Campus Navigation Graph - ARound BulSU\n// Generated: " + new Date().toISOString() + "\n\nexport const campusNodes = {\n" + nodesCode + "\n};\n\nexport const getNode = (id) => campusNodes[id];\nexport const getAllNodes = () => Object.values(campusNodes);\nexport const getNodesByType = (type) => Object.values(campusNodes).filter(n => n.type === type);\n";
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'campusGraph.js'; link.click();
    URL.revokeObjectURL(url);
    showStatus('Generated campusGraph.js');
  };

  const connectionsGeoJSON = useMemo(() => {
    const features = [];
    const added = new Set();
    if (Array.isArray(nodes)) {
      nodes.forEach(node => {
        (node.connections || []).forEach(targetId => {
          const key = [node.id, targetId].sort().join('-');
          if (!added.has(key)) {
            const target = nodes.find(n => n.id === targetId);
            if (target) {
              features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[node.longitude, node.latitude], [target.longitude, target.latitude]] } });
              added.add(key);
            }
          }
        });
      });
    }
    return { type: 'FeatureCollection', features };
  }, [nodes]);

  const clearAllNodes = () => { if (window.confirm('Delete ALL nodes?')) { setNodes([]); localStorage.removeItem('campusNodes'); showStatus('Cleared'); } };

  // Haversine formula to calculate distance between two coordinates in meters
  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Auto-connect nearby nodes within a specified distance
  const autoConnectNearbyNodes = (maxDistance = 25) => {
    let connectionsMade = 0;
    const newNodes = nodes.map(node => ({ ...node, connections: [...(node.connections || [])] }));
    
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const node = newNodes[i];
        const otherNode = newNodes[j];
        
        // Skip if already connected
        if (node.connections.includes(otherNode.id)) continue;
        
        // Calculate distance between nodes
        const dist = getDistanceMeters(
          node.latitude, node.longitude,
          otherNode.latitude, otherNode.longitude
        );
        
        // If within maxDistance, connect them (bidirectional)
        if (dist <= maxDistance) {
          newNodes[i].connections.push(otherNode.id);
          newNodes[j].connections.push(node.id);
          connectionsMade++;
        }
      }
    }
    
    setNodes(newNodes);
    showStatus(`Auto-connected ${connectionsMade} node pairs within ${maxDistance}m`);
  };

  // Connect selected node to all nodes of a specific type within distance
  const connectToNearestOfType = (nodeId, targetType, maxDistance = 50) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const nearestTargets = nodes
      .filter(n => n.type === targetType && n.id !== nodeId)
      .map(n => ({
        ...n,
        distance: getDistanceMeters(node.latitude, node.longitude, n.latitude, n.longitude)
      }))
      .filter(n => n.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    if (nearestTargets.length === 0) {
      showStatus(`No ${nodeTypeLabels[targetType]} found within ${maxDistance}m`);
      return;
    }
    
    const newNodes = nodes.map(n => {
      if (n.id === nodeId) {
        const newConnections = [...(n.connections || [])];
        nearestTargets.forEach(target => {
          if (!newConnections.includes(target.id)) {
            newConnections.push(target.id);
          }
        });
        return { ...n, connections: newConnections };
      }
      // Add reverse connection
      if (nearestTargets.some(t => t.id === n.id) && !(n.connections || []).includes(nodeId)) {
        return { ...n, connections: [...(n.connections || []), nodeId] };
      }
      return n;
    });
    
    setNodes(newNodes);
    showStatus(`Connected to ${nearestTargets.length} nearby ${nodeTypeLabels[targetType]}(s)`);
  };

  // Find and highlight unconnected nodes
  const getUnconnectedNodes = () => {
    return nodes.filter(n => !n.connections || n.connections.length === 0);
  };

  const [showAutoConnectModal, setShowAutoConnectModal] = useState(false);
  const [autoConnectDistance, setAutoConnectDistance] = useState(25);


  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Campus Node Manager</h1>
        <p className="text-gray-400">Manage navigation nodes using Mapbox</p>
      </div>

      {statusMessage && <div className="mb-4 p-3 bg-purple-600 text-white rounded-lg">{statusMessage}</div>}

      <div className="bg-[#1E1E1E] rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <select value={newNodeType} onChange={(e) => setNewNodeType(e.target.value)} className="bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600">
              {Object.entries(nodeTypeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
            <button onClick={() => { setIsAddingNode(!isAddingNode); setCursorPosition(null); }} className={'px-4 py-2 rounded font-medium text-white ' + (isAddingNode ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700')}>
              {isAddingNode ? 'Cancel' : 'Add Node'}
            </button>
          </div>
          <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value)} className="bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600">
            <option value="satellite-streets">Satellite + Streets</option>
            <option value="satellite">Satellite</option>
            <option value="streets">Streets</option>
            <option value="outdoors">Outdoors</option>
          </select>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setShowAutoConnectModal(true)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded" title="Auto-connect nearby nodes">Auto-Connect</button>
            <button onClick={syncToBackend} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Sync</button>
            <button onClick={exportNodes} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">Export JSON</button>
            <button onClick={generateCode} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Generate Code</button>
            <button onClick={clearAllNodes} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Clear All</button>
          </div>
        </div>
        {isConnecting && <div className="mt-3 p-2 bg-yellow-600 text-white rounded flex justify-between"><span>Click node to connect from "{connectingFrom?.name}"</span><button onClick={() => { setIsConnecting(false); setConnectingFrom(null); }} className="px-3 py-1 bg-yellow-800 rounded text-sm">Cancel</button></div>}
        {isAddingNode && <div className="mt-3 p-2 bg-green-600 text-white rounded">Click map to place {nodeTypeLabels[newNodeType]}{cursorPosition && <span className="ml-2 opacity-75">({cursorPosition.lat.toFixed(6)}, {cursorPosition.lng.toFixed(6)})</span>}</div>}
      </div>

      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <Map ref={mapRef} {...viewState} onMove={e => setViewState(e.viewState)} onClick={handleMapClick} onMouseMove={handleMouseMove} mapStyle={mapStyles[mapStyle]} mapboxAccessToken={MAPBOX_TOKEN} style={{ width: '100%', height: '100%' }} cursor={isAddingNode ? 'crosshair' : 'grab'}>
          <NavigationControl position="top-right" />
          <ScaleControl position="bottom-right" />
          <Source id="connections" type="geojson" data={connectionsGeoJSON}>
            <Layer id="connection-lines" type="line" paint={{ 'line-color': '#9333EA', 'line-width': 3, 'line-opacity': 0.8 }} />
          </Source>
          {nodes.map(node => (
            <Marker key={node.id} longitude={node.longitude} latitude={node.latitude} anchor="center" onClick={(e) => handleMarkerClick(node, e)}>
              <div className="cursor-pointer hover:scale-110 transition-transform" style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: nodeTypeColors[node.type] || '#888', border: '3px solid ' + (selectedNode?.id === node.id || connectingFrom?.id === node.id ? '#fff' : 'rgba(255,255,255,0.5)'), boxShadow: selectedNode?.id === node.id ? '0 0 10px white' : '0 2px 4px rgba(0,0,0,0.3)' }} title={node.name + ' (' + node.type + ')'} />
            </Marker>
          ))}
          {isAddingNode && cursorPosition && <Marker longitude={cursorPosition.lng} latitude={cursorPosition.lat} anchor="center"><div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: nodeTypeColors[newNodeType], border: '3px dashed white', opacity: 0.7 }} /></Marker>}
        </Map>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-[#1E1E1E] p-3 rounded-lg text-center"><div className="text-2xl font-bold text-white">{nodes.length}</div><div className="text-gray-400 text-sm">Total</div></div>
        {Object.entries(nodeTypeLabels).map(([type, label]) => <div key={type} className="bg-[#1E1E1E] p-3 rounded-lg text-center"><div className="text-2xl font-bold" style={{ color: nodeTypeColors[type] }}>{nodes.filter(n => n.type === type).length}</div><div className="text-gray-400 text-sm">{label}</div></div>)}
      </div>

      {selectedNode && (
        <div className="fixed bottom-6 right-6 bg-[#1E1E1E] rounded-lg p-4 shadow-xl border border-gray-700 w-80 z-50">
          <div className="flex justify-between items-start mb-3"><h3 className="text-lg font-bold text-white">{selectedNode.name}</h3><button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white">X</button></div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: nodeTypeColors[selectedNode.type] }} /><span className="text-gray-300">{nodeTypeLabels[selectedNode.type]}</span></div>
            <div className="text-gray-400 font-mono">{selectedNode.latitude.toFixed(6)}, {selectedNode.longitude.toFixed(6)}</div>
            <div className="text-gray-400">Connections: {(selectedNode.connections || []).length}</div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => editNode(selectedNode)} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">Edit</button>
            <button onClick={() => startConnecting(selectedNode)} className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">Connect</button>
            <button onClick={() => deleteNode(selectedNode.id)} className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Delete</button>
          </div>
          {(selectedNode.connections || []).length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-gray-400 text-xs mb-2">Connected to:</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {(selectedNode.connections || []).map(cid => { const cn = nodes.find(n => n.id === cid); return cn && <div key={cid} className="flex justify-between text-sm"><span className="text-gray-300">{cn.name}</span><button onClick={() => removeConnection(selectedNode.id, cid)} className="text-red-400 hover:text-red-300 text-xs">Remove</button></div>; })}
              </div>
            </div>
          )}
        </div>
      )}

      {showEditModal && editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Edit Node</h3>
            <div className="space-y-4">
              <div><label className="block text-gray-400 text-sm mb-1">Name</label><input type="text" value={editingNode.name} onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600" /></div>
              <div><label className="block text-gray-400 text-sm mb-1">ID</label><input type="text" value={editingNode.id} onChange={(e) => setEditingNode({ ...editingNode, id: e.target.value })} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600" /></div>
              <div><label className="block text-gray-400 text-sm mb-1">Type</label><select value={editingNode.type} onChange={(e) => setEditingNode({ ...editingNode, type: e.target.value })} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600">{Object.entries(nodeTypeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-sm mb-1">Latitude</label><input type="number" step="0.000001" value={editingNode.latitude} onChange={(e) => setEditingNode({ ...editingNode, latitude: parseFloat(e.target.value) })} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600" /></div>
                <div><label className="block text-gray-400 text-sm mb-1">Longitude</label><input type="number" step="0.000001" value={editingNode.longitude} onChange={(e) => setEditingNode({ ...editingNode, longitude: parseFloat(e.target.value) })} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600" /></div>
              </div>
              <div><label className="block text-gray-400 text-sm mb-1">Description</label><textarea value={editingNode.description || ''} onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })} rows={3} className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEditedNode} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Save</button>
              <button onClick={() => { setShowEditModal(false); setEditingNode(null); }} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 bg-[#1E1E1E] p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Legend</h3>
        <div className="flex flex-wrap gap-4">{Object.entries(nodeTypeLabels).map(([type, label]) => <div key={type} className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{ backgroundColor: nodeTypeColors[type] }} /><span className="text-gray-300 text-sm">{label}</span></div>)}</div>
      </div>

      {/* Unconnected Nodes Warning */}
      {getUnconnectedNodes().length > 0 && (
        <div className="mt-4 bg-yellow-900/50 border border-yellow-600 p-4 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Unconnected Nodes ({getUnconnectedNodes().length})</h3>
          <p className="text-yellow-200 text-sm mb-3">These nodes have no connections and cannot be reached during navigation:</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {getUnconnectedNodes().map(node => (
              <button
                key={node.id}
                onClick={() => { setSelectedNode(node); mapRef.current?.flyTo({ center: [node.longitude, node.latitude], zoom: 19 }); }}
                className="px-2 py-1 bg-yellow-600/50 hover:bg-yellow-600 text-white text-xs rounded"
              >
                {node.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAutoConnectModal(true)}
            className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
          >
            Auto-Connect Nearby Nodes
          </button>
        </div>
      )}

      {/* Auto-Connect Modal */}
      {showAutoConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] rounded-lg p-6 w-96 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Auto-Connect Nodes</h3>
            <p className="text-gray-400 text-sm mb-4">
              Automatically connect nodes that are within a specified distance of each other.
              This helps create a connected network for pathfinding.
            </p>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Maximum Distance (meters)</label>
              <input
                type="number"
                value={autoConnectDistance}
                onChange={(e) => setAutoConnectDistance(parseInt(e.target.value) || 25)}
                min="5"
                max="100"
                className="w-full bg-[#2D2D2D] text-white px-3 py-2 rounded border border-gray-600"
              />
              <p className="text-gray-500 text-xs mt-1">Recommended: 15-30m for walkway nodes, 40-60m for building entrances</p>
            </div>
            <div className="mb-4 p-3 bg-[#2D2D2D] rounded">
              <p className="text-gray-300 text-sm">
                <strong>Current stats:</strong><br />
                • Total nodes: {nodes.length}<br />
                • Unconnected: {getUnconnectedNodes().length}<br />
                • Total connections: {nodes.reduce((acc, n) => acc + (n.connections?.length || 0), 0) / 2}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { autoConnectNearbyNodes(autoConnectDistance); setShowAutoConnectModal(false); }}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
              >
                Connect Nodes
              </button>
              <button
                onClick={() => setShowAutoConnectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusNodeManager;
