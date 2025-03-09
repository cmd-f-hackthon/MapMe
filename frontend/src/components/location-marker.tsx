"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
}

interface LocationMarkerProps {
  map: any;
  user: User;
  onStatusUpdate: (message: string, isError?: boolean) => void;
}

interface LocationMarker {
  _id: string;
  title: string;
  content: string;
  location: {
    coordinates: [number, number];
    notes?: string;
    photo?: string;
    emoji?: string;
  };
  date: string;
}

// Emoji options for markers
const EMOJI_OPTIONS = [
  '😀', '😍', '🥳', '😎', '🤔', '😴', '🏖️', '🏞️', '🌄', '🌆', 
  '🏙️', '🌃', '🌉', '🏕️', '⛺', '🏠', '🏨', '🏫', '🏛️', '⛪', 
  '🕌', '🕍', '🏯', '🏰', '🗼', '🗽', '⛲', '🏝️', '🏔️', '🌋',
  '🗻', '🏥', '🏭', '🏢', '🏣', '🏤', '🏩', '🏪', '🏬', '🏟️',
  '🏦', '🏗️', '🏘️', '🏚️', '🏡', '🏧', '🏭', '🏬', '🏢', '🏣',
  '🍔', '🍕', '🍣', '🍜', '🍦', '🍷', '🍸', '☕', '🍰', '🎂',
  '🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛵',
  '🚲', '🛴', '🚝', '🚄', '🚅', '✈️', '🚀', '🛸', '🚁', '⛵',
  '🚢', '🚤', '⚓', '🏁', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧',
  '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎻', '🎮', '🎯', '🎳'
];

export default function LocationMarker({ map, user, onStatusUpdate }: LocationMarkerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('📍');
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMarkersList, setShowMarkersList] = useState(false);
  const [userMarkers, setUserMarkers] = useState<LocationMarker[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clickListenerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load existing markers when component mounts
  useEffect(() => {
    if (map && user.id) {
      loadUserMarkers();
    }
    
    return () => {
      // Clean up markers and info windows when component unmounts
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
    };
  }, [map, user.id]);

  // Set up map click listener for location selection
  useEffect(() => {
    if (!map || !isSelecting) return;
    
    // Add click listener for location selection
    clickListenerRef.current = map.addListener('click', (e: any) => {
      if (isSelecting && e.latLng) {
        selectLocation(e.latLng);
      }
    });
    
    // Change cursor to indicate selection mode
    map.setOptions({ draggableCursor: 'crosshair' });
    
    return () => {
      if (clickListenerRef.current && window.google?.maps) {
        window.google.maps.event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
      
      // Reset cursor
      if (map) {
        map.setOptions({ draggableCursor: null });
      }
    };
  }, [map, isSelecting]);

  function togglePanel() {
    setIsOpen(!isOpen);
    
    if (isSelecting && !isOpen) {
      // Cancel selection mode when closing panel
      cancelSelection();
    }
    
    // Close marker list if open
    if (showMarkersList) {
      setShowMarkersList(false);
    }
  }

  function toggleMarkersList() {
    setShowMarkersList(!showMarkersList);
    
    // Close main panel if open
    if (isOpen) {
      setIsOpen(false);
    }
    
    // Load markers if showing the list
    if (!showMarkersList) {
      loadUserMarkers();
    }
  }

  function startLocationSelection() {
    setIsSelecting(true);
    onStatusUpdate('Click on the map to select a location');
  }

  function selectLocation(latLng: any) {
    const location = {
      lat: latLng.lat(),
      lng: latLng.lng()
    };
    
    setSelectedLocation(location);
    setIsSelecting(false);
    
    // Remove previous temporary marker if exists
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
    
    // Add a temporary marker at the selected location
    markerRef.current = new window.google.maps.Marker({
      position: location,
      map: map,
      label: {
        text: selectedEmoji,
        fontSize: '24px',
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
      }
    });
    
    onStatusUpdate('Location selected. Add notes or a photo and save.');
    
    // Reset cursor
    map.setOptions({ draggableCursor: null });
  }

  function cancelSelection() {
    setIsSelecting(false);
    
    // Remove temporary marker if exists
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    // Reset cursor
    if (map) {
      map.setOptions({ draggableCursor: null });
    }
    
    onStatusUpdate('Location selection cancelled');
  }

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNotes(e.target.value);
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      onStatusUpdate('Only image files are allowed', true);
      return;
    }

    // Show loading status
    onStatusUpdate('Processing image...');

    // Compress and resize image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        onStatusUpdate('Error reading file', true);
        return;
      }

      // Use HTMLImageElement instead of Image constructor
      const img = document.createElement('img');
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        
        // Calculate new dimensions (max 800px width or height)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onStatusUpdate('Error processing image', true);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with reduced quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Update state with compressed image
        setPhotoUrl(compressedDataUrl);
        onStatusUpdate('Image processed successfully');
      };
      
      img.onerror = () => {
        onStatusUpdate('Error loading image', true);
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = (error) => {
      onStatusUpdate('Error reading file', true);
    };
    
    reader.readAsDataURL(file);
  }

  function saveLocationMarker() {
    if (!selectedLocation) {
      onStatusUpdate('Please select a location on the map first', true);
      return;
    }
    
    if (!notes && !photoUrl) {
      onStatusUpdate('Please add notes or a photo', true);
      return;
    }
    
    onStatusUpdate('Saving location marker...');
    
    const markerData = {
      title: `${user.name}'s Marker - ${new Date().toLocaleString()}`,
      content: notes || 'Location marker',
      user: user,
      location: {
        type: 'Point',
        coordinates: [selectedLocation.lng, selectedLocation.lat],
        notes: notes,
        photo: photoUrl,
        emoji: selectedEmoji
      },
      // Empty path for markers
      path: []
    };

    fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(markerData)
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
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
      console.log('Location marker saved:', data);
      onStatusUpdate('Location marker saved successfully!');
      
      // Clear form
      setNotes('');
      setPhotoUrl(null);
      setSelectedLocation(null);
      
      // Remove temporary marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Reload markers
      loadUserMarkers();
      
      // Close panel
      setIsOpen(false);
    })
    .catch(error => {
      console.error('Error saving location marker:', error);
      onStatusUpdate(`Error saving location marker: ${error.message || 'Unknown error'}`, true);
    });
  }

  function loadUserMarkers() {
    if (!user.id || !map) return;
    
    onStatusUpdate('Loading your location markers...');
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());
    setMarkers([]);
    setInfoWindows([]);
    
    fetch(`/api/journal/user/${user.id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          try {
            return Promise.reject(JSON.parse(text));
          } catch (e) {
            return Promise.reject(new Error(`Server error: ${text}`));
          }
        });
      }
      return response.json();
    })
    .then(entries => {
      // Filter entries that are markers (empty path) and have notes or photos
      const markerEntries = entries.filter((entry: any) => 
        (!entry.path || entry.path.length === 0) && 
        (entry.location.notes || entry.location.photo)
      );
      
      // Store marker entries for the list view
      setUserMarkers(markerEntries);
      
      if (markerEntries.length === 0) {
        onStatusUpdate('No location markers found');
        return;
      }
      
      // Create markers for each entry
      const newMarkers: any[] = [];
      const newInfoWindows: any[] = [];
      
      markerEntries.forEach((entry: any) => {
        const position = {
          lat: entry.location.coordinates[1],
          lng: entry.location.coordinates[0]
        };
        
        // Create marker with emoji if available
        const marker = new window.google.maps.Marker({
          position: position,
          map: map,
          title: entry.title,
          label: {
            text: entry.location.emoji || '📍',
            fontSize: '24px',
            fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
          }
        });
        
        // Create info window content
        const contentString = `
          <div class="info-window" style="max-width: 300px;">
            <h3 style="margin-top: 0; color: #4285F4;">${entry.title}</h3>
            ${entry.location.notes ? `<p>${entry.location.notes}</p>` : ''}
            ${entry.location.photo ? `<img src="${entry.location.photo}" style="max-width: 100%; max-height: 200px; margin-top: 8px; border-radius: 4px;">` : ''}
            <p style="margin-bottom: 0; color: #666; font-size: 12px;">Added on ${new Date(entry.date).toLocaleString()}</p>
          </div>
        `;
        
        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: contentString
        });
        
        // Add click listener to marker
        marker.addListener('click', () => {
          // Close all other info windows
          newInfoWindows.forEach(iw => iw.close());
          
          // Open this info window
          infoWindow.open(map, marker);
        });
        
        newMarkers.push(marker);
        newInfoWindows.push(infoWindow);
      });
      
      setMarkers(newMarkers);
      setInfoWindows(newInfoWindows);
      
      onStatusUpdate(`Loaded ${newMarkers.length} location markers`);
    })
    .catch(error => {
      console.error('Error loading location markers:', error);
      onStatusUpdate(`Error loading location markers: ${error.message || 'Unknown error'}`, true);
    });
  }

  function deleteMarker(markerId: string, event?: React.MouseEvent) {
    // Stop event propagation if provided (to prevent clicking the marker item)
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm('Are you sure you want to delete this marker? This action cannot be undone.')) {
      return;
    }
    
    onStatusUpdate('Deleting marker...');
    
    fetch(`/api/journal/${markerId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
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
      console.log('Marker deleted:', data);
      onStatusUpdate('Marker deleted successfully');
      
      // Reload markers
      loadUserMarkers();
    })
    .catch(error => {
      console.error('Error deleting marker:', error);
      onStatusUpdate(`Error deleting marker: ${error.message || 'Unknown error'}`, true);
    });
  }

  function showMarkerOnMap(marker: LocationMarker) {
    if (!map) return;
    
    // Center map on marker
    map.setCenter({
      lat: marker.location.coordinates[1],
      lng: marker.location.coordinates[0]
    });
    
    // Zoom in
    map.setZoom(18);
    
    // Find and click the corresponding marker to open info window
    const googleMarker = markers.find(m => {
      const position = m.getPosition();
      return (
        position.lat() === marker.location.coordinates[1] && 
        position.lng() === marker.location.coordinates[0]
      );
    });
    
    if (googleMarker) {
      // Trigger click event on marker
      window.google.maps.event.trigger(googleMarker, 'click');
    }
    
    // Close markers list
    setShowMarkersList(false);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  return (
    <>
      {/* Floating Action Buttons - moved higher up and redesigned */}
      <div className="fixed bottom-24 left-24 flex flex-col gap-3 items-start z-10">
        {/* List Markers Button */}
        <button
          onClick={toggleMarkersList}
          className={`w-12 h-12 rounded-full ${showMarkersList ? 'bg-blue-600' : 'bg-white'} ${showMarkersList ? 'text-white' : 'text-blue-500'} shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200`}
          title="List Markers"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        
        {/* Add Marker Button */}
        <button
          onClick={togglePanel}
          className={`w-12 h-12 rounded-full ${isOpen ? 'bg-blue-600' : 'bg-white'} ${isOpen ? 'text-white' : 'text-blue-500'} shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors border border-gray-200`}
          title="Add Marker"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Add Marker Panel - redesigned as side panel */}
      {isOpen && (
        <div className="fixed right-4 top-4 bottom-4 w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out">
          <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Add Location Marker</h3>
            <button 
              onClick={togglePanel}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {!selectedLocation ? (
              <button
                onClick={startLocationSelection}
                className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mb-4 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {isSelecting ? 'Click on Map to Select Location' : 'Select Location on Map'}
              </button>
            ) : (
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Selected Location:</span>
                  <button
                    onClick={cancelSelection}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs mt-1 bg-gray-100 p-2 rounded">
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            )}
            
            {/* Emoji Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Emoji for Marker
              </label>
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 flex items-center justify-center text-2xl border rounded cursor-pointer mr-2 hover:bg-gray-50"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  {selectedEmoji}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded text-sm"
                >
                  {showEmojiPicker ? 'Hide Emojis' : 'Choose Emoji'}
                </button>
              </div>
              
              {showEmojiPicker && (
                <div className="mt-2 p-2 border rounded bg-white max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_OPTIONS.map((emoji, index) => (
                      <div 
                        key={index}
                        className={`w-8 h-8 flex items-center justify-center text-xl cursor-pointer hover:bg-gray-100 rounded ${selectedEmoji === emoji ? 'bg-blue-100' : ''}`}
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setShowEmojiPicker(false);
                          
                          // Update temporary marker if it exists
                          if (markerRef.current && selectedLocation) {
                            markerRef.current.setLabel({
                              text: emoji,
                              fontSize: '24px',
                              fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
                            });
                          }
                        }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={3}
                placeholder="Add notes about this location..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                ref={fileInputRef}
              />
              <p className="mt-1 text-xs text-gray-500">Max file size: 5MB</p>
            </div>
            
            {photoUrl && (
              <div className="mb-4 relative">
                <div className="relative h-40 w-full">
                  <Image 
                    src={photoUrl} 
                    alt="Location photo" 
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <button
                  onClick={() => {
                    setPhotoUrl(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveLocationMarker}
                className="flex-1 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={!selectedLocation || (!notes && !photoUrl)}
              >
                Save Marker
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Markers List Panel - redesigned as side panel */}
      {showMarkersList && (
        <div className="fixed right-4 top-4 bottom-4 w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out">
          <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">My Location Markers</h3>
            <button 
              onClick={() => setShowMarkersList(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {userMarkers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-lg font-medium">No markers found</p>
                <p className="text-sm">Add some markers to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userMarkers.map((marker, index) => (
                  <div 
                    key={marker._id || index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer relative transition-colors"
                    onClick={() => showMarkerOnMap(marker)}
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3 w-10 h-10 flex items-center justify-center">
                        {marker.location.emoji || '📍'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{marker.title}</div>
                        {marker.location.notes && (
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {marker.location.notes}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(marker.date)}
                        </div>
                      </div>
                      {marker.location.photo && (
                        <div className="w-12 h-12 relative ml-2">
                          <Image 
                            src={marker.location.photo} 
                            alt="Marker photo" 
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => deleteMarker(marker._id, e)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      title="Delete marker"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={loadUserMarkers}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh Markers
            </button>
          </div>
        </div>
      )}
    </>
  );
} 