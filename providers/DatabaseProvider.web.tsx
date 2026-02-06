import type { ReactNode } from 'react';

interface DatabaseProviderProps {
  children: ReactNode;
}

// В веб-версии SQLite недоступен, поэтому просто пробрасываем children.
export function DatabaseProvider({ children }: DatabaseProviderProps) {
  return <>{children}</>;
}

