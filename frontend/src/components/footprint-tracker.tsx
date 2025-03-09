"use client";

import { useState, useEffect } from 'react';
import Map from './map';
import UserInfo from './user-info';
import RouteTracker from './route-tracker';
import RoutesList from './routes-list';
import StatusDisplay from './status-display';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function FootprintTracker() {
  const [map, setMap] = useState<any>(null);
  const [user, setUser] = useState<User>({
    id: 'anonymous-' + Date.now(),
    name: 'Anonymous User',
    email: ''
  });
  const [statusMessage, setStatusMessage] = useState('Welcome to Footprint Tracker');
  const [isError, setIsError] = useState(false);

  function handleMapLoad(mapInstance: any) {
    console.log('Map loaded in FootprintTracker');
    setMap(mapInstance);
  }

  function handleUserChange(newUser: User) {
    setUser(newUser);
  }

  function updateStatus(message: string, error = false) {
    setStatusMessage(message);
    setIsError(error);
  }

  return (
    <div className="relative h-screen w-full">
      {/* Map takes the full screen */}
      <Map onMapLoad={handleMapLoad} />
      
      {/* Controls panel */}
      <div className="absolute top-4 left-4 z-10 bg-white p-4 rounded-lg shadow-md max-w-xs">
        <UserInfo onUserChange={handleUserChange} />
        
        {map && (
          <>
            <div className="mt-4">
              <RouteTracker 
                map={map} 
                user={user} 
                onStatusUpdate={updateStatus} 
              />
            </div>
            
            <div className="mt-4">
              <RoutesList 
                map={map} 
                user={user} 
                onStatusUpdate={updateStatus} 
              />
            </div>
          </>
        )}
        
        <StatusDisplay 
          message={statusMessage} 
          isError={isError} 
        />
      </div>
    </div>
  );
} 