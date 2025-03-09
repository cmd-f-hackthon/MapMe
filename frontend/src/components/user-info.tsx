"use client";

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserInfoProps {
  onUserChange: (user: User) => void;
}

export default function UserInfo({ onUserChange }: UserInfoProps) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'anonymous-' + Date.now(),
    name: 'Anonymous User',
    email: ''
  });
  const [showForm, setShowForm] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Load saved user on component mount
  useEffect(() => {
    loadSavedUser();
  }, []);

  function saveUserInfo() {
    if (!userName.trim()) {
      updateStatus('Please enter your name', true);
      return;
    }
    
    // Generate a consistent user ID based on the username
    // This ensures the same username always gets the same ID
    const userId = 'user-' + userName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const user = {
      id: userId,
      name: userName,
      email: userEmail
    };
    
    setCurrentUser(user);
    setShowForm(false);
    
    // Save to localStorage for persistence
    localStorage.setItem('footprintUser', JSON.stringify(user));
    
    // Notify parent component
    onUserChange(user);
    
    updateStatus(`Welcome, ${userName}! You can now start tracking or drawing routes.`);
  }
  
  function changeUser() {
    setShowForm(true);
  }
  
  // Check if user is already saved
  function loadSavedUser() {
    const savedUser = localStorage.getItem('footprintUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setUserName(user.name);
        setUserEmail(user.email || '');
        setShowForm(false);
        
        // Notify parent component
        onUserChange(user);
      } catch (e) {
        console.error('Error loading saved user:', e);
      }
    }
  }

  function updateStatus(message: string, isError = false) {
    // This function would ideally update a status component
    // For now, we'll just log to console
    console.log(message);
    
    // In a real app, you might want to use a toast notification
    // or update a status element in the UI
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {showForm ? (
        <div className="user-form">
          <h3 className="text-lg font-bold mb-2">User Information</h3>
          <div className="mb-2">
            <label htmlFor="userName" className="block text-sm font-medium">
              Your Name:
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label htmlFor="userEmail" className="block text-sm font-medium">
              Email (optional):
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={saveUserInfo}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save User Info
          </button>
        </div>
      ) : (
        <div className="user-info bg-green-50 p-2 rounded">
          Logged in as: <span className="font-bold">{currentUser.name}</span>
          <button
            onClick={changeUser}
            className="float-right text-xs p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
} 