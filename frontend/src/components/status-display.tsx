"use client";

import { useState, useEffect } from 'react';

interface StatusDisplayProps {
  message: string;
  isError?: boolean;
}

export default function StatusDisplay({ message, isError = false }: StatusDisplayProps) {
  return (
    <div 
      className={`p-2 rounded mt-2 ${
        isError 
          ? 'bg-red-100 text-red-800' 
          : 'bg-green-100 text-green-800'
      }`}
    >
      {message}
    </div>
  );
} 