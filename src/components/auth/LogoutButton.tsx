'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className={`button is-light ${isLoading ? 'is-loading' : ''}`}
      onClick={handleLogout}
      disabled={isLoading}
    >
      <i className="fas fa-sign-out-alt mr-2"></i>
      Logout
    </button>
  );
}