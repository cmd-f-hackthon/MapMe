"use client";

import { useState, useEffect, useRef } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface RouteTrackerProps {
  map: any;
  user: User;
  onStatusUpdate: (message: string, isError?: boolean) => void;
}

export default function RouteTracker({ map, user, onStatusUpdate }: RouteTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [pathMarkers, setPathMarkers] = useState<any[]>([]);
  const [drawnPoints, setDrawnPoints] = useState<{lat: number, lng: number, timestamp: string}[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const currentPolylineRef = useRef<any | null>(null);
  const clickListenerRef = useRef<any | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (clickListenerRef.current && window.google?.maps) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }
      
      clearPath();
      cancelDrawing();
    };
  }, []);

  // Set up map click listener when map changes
  useEffect(() => {
    if (!map || !window.google?.maps) return;
    
    console.log('Setting up map click listener for drawing');
    
    // Add click listener for manual drawing
    clickListenerRef.current = map.addListener('click', (e: any) => {
      if (isDrawingMode && e.latLng) {
        console.log('Map clicked in drawing mode:', e.latLng.toString());
        addPoint(e.latLng);
      }
    });
    
    return () => {
      if (clickListenerRef.current && window.google?.maps) {
        window.google.maps.event.removeListener(clickListenerRef.current);
      }
    };
  }, [map, isDrawingMode]);

  function toggleTracking() {
    if (!navigator.geolocation) {
      onStatusUpdate("Geolocation is not supported", true);
      return;
    }

    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }

  function startTracking() {
    if (isTracking || !map || !window.google?.maps) return;
    setIsTracking(true);
    
    onStatusUpdate("Tracking started");

    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        const newPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Add new footprint dot
        const footprintDot = new window.google.maps.Marker({
          position: newPos,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 4,  // Smaller than current position marker
            fillColor: "#FF0000",  // Red dots for footprints
            fillOpacity: 0.7,
            strokeColor: "#FFFFFF",
            strokeWeight: 1,
          }
        });
        
        setPathMarkers(prev => [...prev, footprintDot]);

        // Update status
        onStatusUpdate(`
          Tracking active | 
          Points: ${pathMarkers.length + 1} | 
          Accuracy: ${position.coords.accuracy.toFixed(1)}m
        `);

        // Center map
        map.panTo(newPos);
      },
      error => {
        onStatusUpdate(`Error: ${error.message}`, true);
        console.error('Position error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 1000
      }
    );
  }

  function stopTracking() {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
      
      // Only save if we have at least 2 points
      if (pathMarkers.length >= 2) {
        saveTrackedRoute();
      } else {
        onStatusUpdate("Tracking stopped. Not enough points to save.");
      }
    }
  }
  
  function saveTrackedRoute() {
    if (pathMarkers.length < 2) {
      onStatusUpdate('Not enough points to save', true);
      return;
    }
    
    onStatusUpdate('Saving tracked route...');
    
    // Convert markers to path points
    const trackedPoints = pathMarkers.map(marker => ({
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng(),
      timestamp: new Date().toISOString()
    }));
    
    const routeData = {
      title: `${user.name}'s Tracked Route - ${new Date().toLocaleString()}`,
      content: `GPS tracked route with ${trackedPoints.length} points by ${user.name}`,
      user: user,
      location: {
        type: 'Point',
        coordinates: [trackedPoints[0].lng, trackedPoints[0].lat]
      },
      path: trackedPoints.map(point => ({
        type: 'Point',
        coordinates: [point.lng, point.lat],
        timestamp: point.timestamp
      }))
    };

    console.log('Saving route data:', routeData);

    fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData)
    })
    .then(response => {
      console.log('Save route response status:', response.status);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.log('Error response text:', text);
          try {
            return Promise.reject(JSON.parse(text));
          } catch (e) {
            return Promise.reject(new Error(`Server error: ${text}`));
          }
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Tracked route saved:', data);
      onStatusUpdate(`Tracking stopped. Route saved successfully! ID: ${data._id}`);
      
      // Calculate and display the distance
      const distance = calculateDistance(trackedPoints);
      setDistance(distance);
    })
    .catch(error => {
      console.error('Error saving tracked route:', error);
      onStatusUpdate(`Tracking stopped. Error saving route: ${error.message || 'Unknown error'}`, true);
    });
  }

  function clearPath() {
    // Remove all footprint dots from the map
    pathMarkers.forEach(marker => marker.setMap(null));
    setPathMarkers([]);
    setDistance(null);
    onStatusUpdate("Path cleared");
  }

  function startDrawing() {
    if (!map || !window.google?.maps) return;
    
    console.log('Starting drawing mode');
    setIsDrawingMode(true);
    setDrawnPoints([]);
    onStatusUpdate('Click on the map to draw your route. Click "Save Route" when finished.');
    
    // Start new polyline
    currentPolylineRef.current = new window.google.maps.Polyline({
      map: map,
      path: [],
      strokeColor: '#FF0000',
      strokeWeight: 2
    });
  }

  function addPoint(latLng: any) {
    console.log('Adding point:', latLng);
    
    if (!isDrawingMode) {
      console.log('Not in drawing mode, ignoring point');
      return;
    }
    
    if (!currentPolylineRef.current) {
      console.log('No current polyline, creating one');
      currentPolylineRef.current = new window.google.maps.Polyline({
        map: map,
        path: [],
        strokeColor: '#FF0000',
        strokeWeight: 2
      });
    }
    
    try {
      const newPoint = {
        lat: latLng.lat(),
        lng: latLng.lng(),
        timestamp: new Date().toISOString()
      };
      
      console.log('New point created:', newPoint);
      
      // Update state with the new point
      setDrawnPoints(prev => {
        const updatedPoints = [...prev, newPoint];
        console.log('Updated drawn points:', updatedPoints);
        
        // Update the polyline path
        if (currentPolylineRef.current) {
          const path = updatedPoints.map(p => ({ lat: p.lat, lng: p.lng }));
          currentPolylineRef.current.setPath(path);
        }
        
        return updatedPoints;
      });
      
      onStatusUpdate(`Points in route: ${drawnPoints.length + 1}`);
    } catch (error) {
      console.error('Error adding point:', error);
      onStatusUpdate('Error adding point to route', true);
    }
  }

  function saveDrawnRoute() {
    if (drawnPoints.length < 2) {
      onStatusUpdate('Please draw at least 2 points for a route', true);
      return;
    }

    onStatusUpdate('Saving route...');
    
    const routeData = {
      title: `${user.name}'s Route - ${new Date().toLocaleString()}`,
      content: `Manual route with ${drawnPoints.length} points drawn by ${user.name}`,
      user: user,
      location: {
        type: 'Point',
        coordinates: [drawnPoints[0].lng, drawnPoints[0].lat]
      },
      path: drawnPoints.map(point => ({
        type: 'Point',
        coordinates: [point.lng, point.lat],
        timestamp: point.timestamp
      }))
    };

    console.log('Saving drawn route data:', routeData);

    fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(routeData)
    })
    .then(response => {
      console.log('Save drawn route response status:', response.status);
      
      if (!response.ok) {
        return response.text().then(text => {
          console.log('Error response text:', text);
          try {
            return Promise.reject(JSON.parse(text));
          } catch (e) {
            return Promise.reject(new Error(`Server error: ${text}`));
          }
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Route saved:', data);
      onStatusUpdate(`Route saved successfully! ID: ${data._id}`);
      
      // Calculate and display the distance
      const distance = calculateDistance(drawnPoints);
      setDistance(distance);
      
      cancelDrawing();
    })
    .catch(error => {
      console.error('Error saving route:', error);
      onStatusUpdate(`Error saving route: ${error.message || 'Unknown error'}`, true);
    });
  }

  function cancelDrawing() {
    setIsDrawingMode(false);
    if (currentPolylineRef.current) {
      currentPolylineRef.current.setMap(null);
      currentPolylineRef.current = null;
    }
    setDrawnPoints([]);
    onStatusUpdate('Drawing cancelled');
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

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={toggleTracking}
        className={`w-full font-bold transition-all duration-300 ease-in-out p-2 rounded ${
          isTracking 
            ? 'bg-red-500 text-white' 
            : 'bg-white hover:bg-gray-100 border border-gray-300'
        }`}
      >
        {isTracking ? 'Stop Tracking' : 'Start Tracking'}
      </button>
      
      <button 
        onClick={clearPath}
        className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded"
      >
        Clear Path
      </button>
      
      <div className="drawing-controls flex flex-col gap-2">
        {!isDrawingMode ? (
          <button 
            onClick={startDrawing}
            className="bg-white hover:bg-gray-100 border border-gray-300 p-2 rounded"
          >
            Start Drawing Route
          </button>
        ) : (
          <>
            <button 
              onClick={saveDrawnRoute}
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
            >
              Save Route
            </button>
            <button 
              onClick={cancelDrawing}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
            >
              Cancel Drawing
            </button>
          </>
        )}
      </div>
      
      {distance !== null && (
        <div className="mt-2 font-bold">
          Total Distance: {(distance / 1000).toFixed(2)} km
        </div>
      )}
    </div>
  );
} 