"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface RoutePoint {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
  timestamp: string;
}

interface Route {
  _id: string;
  title: string;
  content: string;
  user: User;
  location: {
    type: string;
    coordinates: [number, number];
    address?: string;
    details?: any;
  };
  path: RoutePoint[];
  date: string;
}

interface RoutesListProps {
  map: any;
  user: User;
  onStatusUpdate: (message: string, isError?: boolean) => void;
}

export default function RoutesList({ map, user, onStatusUpdate }: RoutesListProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showRoutes, setShowRoutes] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [showingAllRoutes, setShowingAllRoutes] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Store polylines for user routes
  const [userRoutesPolylines, setUserRoutesPolylines] = useState<any[]>([]);
  const [activeRoutePolyline, setActiveRoutePolyline] = useState<any | null>(null);
  const [routeMarkers, setRouteMarkers] = useState<any[]>([]);

  // Load user routes when component mounts or user changes
  useEffect(() => {
    if (user && user.id !== 'anonymous-' + Date.now().toString().substring(0, 8)) {
      loadUserRoutes();
    }
  }, [user]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearUserRoutesFromMap();
    };
  }, []);

  function loadUserRoutes() {
    if (!user || !user.id) {
      onStatusUpdate('Please save your user information first', true);
      return;
    }
    
    onStatusUpdate('Loading your routes...');
    
    // Clear previous routes
    clearUserRoutesFromMap();
    
    // Show the routes panel
    setShowRoutes(true);
    
    // Log the user ID we're fetching routes for
    console.log('Fetching routes for user ID:', user.id);
    
    // Fetch user routes from the server
    fetch(`/api/journal/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        // Log the response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          // Try to get the error message as text first
          return response.text().then(text => {
            console.log('Error response text:', text);
            try {
              // Try to parse as JSON if possible
              return Promise.reject(JSON.parse(text));
            } catch (e) {
              // If not valid JSON, return the text as error
              return Promise.reject(new Error(`Server error: ${text}`));
            }
          });
        }
        
        return response.json();
      })
      .then(routes => {
        console.log('Routes loaded successfully:', routes);
        setRoutes(routes || []);
        
        if (!routes || routes.length === 0) {
          onStatusUpdate('No routes found for your account');
          return;
        }
        
        onStatusUpdate(`Found ${routes.length} saved routes`);
      })
      .catch(error => {
        console.error('Error loading routes:', error);
        onStatusUpdate(`Error loading your routes: ${error.message || 'Unknown error'}`, true);
      });
  }

  function showRouteOnMap(route: Route) {
    if (!map || !window.google?.maps) return;
    
    // If all routes are currently displayed, hide them first
    if (showingAllRoutes) {
      hideAllRoutes();
    }
    
    // Clear any previously highlighted route
    if (activeRoutePolyline) {
      activeRoutePolyline.setMap(null);
      setActiveRoutePolyline(null);
    }
    
    if (!route.path || route.path.length < 2) {
      onStatusUpdate('This route has no path data', true);
      return;
    }
    
    // Create path coordinates
    const pathCoords = route.path.map(point => ({
      lat: point.coordinates[1], // Latitude is second in GeoJSON
      lng: point.coordinates[0]  // Longitude is first in GeoJSON
    }));
    
    // Create a polyline for the route
    const polyline = new window.google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: '#4CAF50', // Green color for the active route
      strokeOpacity: 1.0,
      strokeWeight: 4
    });
    
    // Add the polyline to the map
    polyline.setMap(map);
    setActiveRoutePolyline(polyline);
    setActiveRouteId(route._id);
    
    // Fit the map to the route bounds
    const bounds = new window.google.maps.LatLngBounds();
    pathCoords.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);
    
    // Calculate and display distance
    const distance = calculateDistance(pathCoords);
    setDistance(distance);
    
    onStatusUpdate(`Showing route: ${route.title || 'Unnamed Route'}`);
  }

  function showAllRoutes() {
    if (!map || !window.google?.maps) return;
    
    if (!routes || routes.length === 0) {
      onStatusUpdate('No routes to display', true);
      return;
    }
    
    // Clear any previously displayed routes
    clearUserRoutesFromMap();
    setShowingAllRoutes(true);
    
    // Create a bounds object to fit all routes
    const bounds = new window.google.maps.LatLngBounds();
    let totalDistance = 0;
    let totalPoints = 0;
    
    // Create a different color for each route
    const colors = ['#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', '#795548', '#607D8B'];
    
    // Store new polylines and markers
    const newPolylines: any[] = [];
    const newMarkers: any[] = [];
    
    // Display each route on the map
    routes.forEach((route, index) => {
      if (!route.path || route.path.length < 2) return;
      
      // Create path coordinates
      const pathCoords = route.path.map(point => ({
        lat: point.coordinates[1], // Latitude is second in GeoJSON
        lng: point.coordinates[0]  // Longitude is first in GeoJSON
      }));
      
      // Calculate distance for this route
      const routeDistance = calculateDistance(pathCoords);
      totalDistance += routeDistance;
      totalPoints += pathCoords.length;
      
      // Create a polyline for the route with a unique color
      const color = colors[index % colors.length];
      const polyline = new window.google.maps.Polyline({
        path: pathCoords,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 3
      });
      
      // Add the polyline to the map
      polyline.setMap(map);
      newPolylines.push(polyline);
      
      // Add route points to bounds
      pathCoords.forEach(coord => bounds.extend(coord));
      
      // Add start and end markers
      if (pathCoords.length > 0) {
        // Start marker (green)
        const startMarker = new window.google.maps.Marker({
          position: pathCoords[0],
          map: map,
          title: `Start: ${route.title}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });
        
        // End marker (red)
        const endMarker = new window.google.maps.Marker({
          position: pathCoords[pathCoords.length - 1],
          map: map,
          title: `End: ${route.title}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: '#F44336',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          }
        });
        
        newMarkers.push(startMarker, endMarker);
      }
    });
    
    // Update state with new polylines and markers
    setUserRoutesPolylines(newPolylines);
    setRouteMarkers(newMarkers);
    
    // Fit the map to show all routes
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
    
    // Update distance
    setDistance(totalDistance);
    
    onStatusUpdate(`Showing all ${routes.length} routes with ${totalPoints} total points`);
  }

  function hideAllRoutes() {
    clearUserRoutesFromMap();
    setShowingAllRoutes(false);
    setDistance(null);
    setActiveRouteId(null);
    onStatusUpdate('All routes hidden');
  }

  function clearUserRoutesFromMap() {
    // Clear all user route polylines
    userRoutesPolylines.forEach(polyline => {
      polyline.setMap(null);
    });
    setUserRoutesPolylines([]);
    
    // Clear all markers
    routeMarkers.forEach(marker => {
      marker.setMap(null);
    });
    setRouteMarkers([]);
    
    // Clear active route
    if (activeRoutePolyline) {
      activeRoutePolyline.setMap(null);
      setActiveRoutePolyline(null);
    }
    
    setShowingAllRoutes(false);
  }

  function hideUserRoutes() {
    setShowRoutes(false);
    clearUserRoutesFromMap();
    setDistance(null);
    onStatusUpdate('Routes panel hidden');
  }

  function calculateDistance(path: {lat: number, lng: number}[]) {
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const p1 = path[i - 1];
      const p2 = path[i];
      
      // Haversine formula
      const R = 6371e3; // Earth's radius in meters
      const φ1 = p1.lat * Math.PI/180;
      const φ2 = p2.lat * Math.PI/180;
      const Δφ = (p2.lat-p1.lat) * Math.PI/180;
      const Δλ = (p2.lng-p1.lng) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      
      totalDistance += R * c;
    }
    return totalDistance;
  }

  if (!showRoutes) {
    return (
      <button 
        onClick={loadUserRoutes}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full"
      >
        Show My Routes
      </button>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-h-96 overflow-auto">
      <h4 className="font-bold mb-2">My Saved Routes</h4>
      
      <div className="flex justify-between mb-2">
        <button 
          onClick={showAllRoutes}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex-1 mr-1"
        >
          Show All Routes
        </button>
        <button 
          onClick={hideAllRoutes}
          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded flex-1 ml-1"
        >
          Hide All Routes
        </button>
      </div>
      
      {routes.length === 0 ? (
        <p>No saved routes found.</p>
      ) : (
        <div className="space-y-2">
          {routes.map(route => {
            const routeDate = new Date(route.date).toLocaleDateString();
            const routeTime = new Date(route.date).toLocaleTimeString();
            const pointCount = route.path ? route.path.length : 0;
            
            return (
              <div 
                key={route._id}
                className={`p-2 border-b cursor-pointer hover:bg-gray-50 ${
                  activeRouteId === route._id ? 'bg-green-50' : ''
                }`}
                onClick={() => showRouteOnMap(route)}
              >
                <div className="font-bold">{route.title || 'Unnamed Route'}</div>
                <div className="text-xs">{routeDate} at {routeTime}</div>
                <div className="text-xs">{pointCount} points</div>
              </div>
            );
          })}
        </div>
      )}
      
      {distance !== null && (
        <div className="mt-2 font-bold">
          Total Distance: {(distance / 1000).toFixed(2)} km
        </div>
      )}
      
      <button 
        onClick={hideUserRoutes}
        className="mt-4 bg-gray-200 hover:bg-gray-300 p-2 rounded w-full"
      >
        Hide Routes Panel
      </button>
    </div>
  );
} 