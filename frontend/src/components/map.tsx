"use client";

import { useEffect, useRef, useState } from 'react';

// Declare types for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface MapProps {
  onMapLoad?: (map: any) => void;
}

export default function Map({ onMapLoad }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps script manually
  useEffect(() => {
    // Prevent multiple script loads
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      if (window.google?.maps) {
        initializeMap();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=drawing`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    
    script.onload = () => {
      console.log('Google Maps script loaded');
      initializeMap();
    };
    
    script.onerror = () => {
      console.error('Error loading Google Maps script');
      setIsLoading(false);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // No need to remove the script on unmount as it should be loaded only once
    };
  }, []);

  // Initialize map after script is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;
    
    try {
      const defaultPosition = { lat: 49.2676, lng: -123.2525 }; // UBC Bookstore
      
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 16,
        center: defaultPosition,
        mapTypeId: 'roadmap'
      });

      setIsLoading(false);

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const currentPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            mapInstance.setCenter(currentPosition);
            
            // Create initial position marker
            new window.google.maps.Marker({
              position: currentPosition,
              map: mapInstance,
              title: "Current Position",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              }
            });
            
            if (onMapLoad) {
              onMapLoad(mapInstance);
            }
          },
          error => {
            console.error('Geolocation error:', error);
            if (onMapLoad) {
              onMapLoad(mapInstance);
            }
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser");
        if (onMapLoad) {
          onMapLoad(mapInstance);
        }
      }

      // Initialize drawing manager if available
      if (window.google.maps.drawing) {
        try {
          const drawingManager = new window.google.maps.drawing.DrawingManager({
            drawingMode: null,
            drawingControl: false,
            polylineOptions: {
              strokeColor: '#FF0000',
              strokeWeight: 2
            }
          });
          drawingManager.setMap(mapInstance);
        } catch (e) {
          console.error('Error initializing drawing manager:', e);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2">Loading map...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ height: '100vh', width: '100%' }} 
        id="google-map" 
      />
    </div>
  );
}
