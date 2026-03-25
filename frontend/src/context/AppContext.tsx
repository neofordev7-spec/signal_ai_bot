'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TelegramUser } from '@/lib/types';
import { getTelegramUser, initTelegramApp } from '@/lib/telegram';

interface AppState {
  user: TelegramUser | null;
  isLoading: boolean;
}

const AppContext = createContext<AppState>({ user: null, isLoading: true });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initTelegramApp();
    const tgUser = getTelegramUser();
    if (tgUser) {
      setUser(tgUser);
    }
    setIsLoading(false);
  }, []);

  return (
    <AppContext.Provider value={{ user, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
