"use client"; 

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const handleLoginSuccess = (response: any) => {
    console.log('Login Success:', response);
  };

  const handleLoginFailure = () => {
    console.error('Login Failed');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl mb-4">Login with Google</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default AuthPage;