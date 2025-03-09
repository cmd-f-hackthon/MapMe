"use client"; 

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const router = useRouter();

  const handleLoginSuccess = async (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    if (credentialResponse.credential) {
      // Redirect to a specific page after successful login
      router.push('/homepage');
    }

    // // TODO: Send the credential to the server to authenticate
    // if (credentialResponse.credential) {
    //   try {
    //     const response = await fetch('http://localhost:4000/auth/google', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //       body: JSON.stringify({ credential: credentialResponse.credential }),
    //     });

    //     const data = await response.json();
    //     console.log('Tokens:', data);

    //     // Check for access token and refresh token and store them
    //     if (data.access_token) {
    //       localStorage.setItem('accessToken', data.access_token);
    //     }
    //     if (data.refresh_token) {
    //       localStorage.setItem('refreshToken', data.refresh_token);
    //     }

    //     // Redirect user to homepage
    //     router.push('/homepage');
    //   } catch (error) {
    //     console.error('Failed to authenticate:', error);
    //   }
    // }

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