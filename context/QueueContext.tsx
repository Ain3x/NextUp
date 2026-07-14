import React, { createContext, useContext } from 'react';
import { useQueue } from '@/hooks/useQueue';
import type { UseQueueReturn } from '@/hooks/useQueue';

const QueueContext = createContext<UseQueueReturn | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const queue = useQueue();
  return <QueueContext.Provider value={queue}>{children}</QueueContext.Provider>;
}

export function useQueueContext(): UseQueueReturn {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueueContext must be used inside QueueProvider');
  return ctx;
}