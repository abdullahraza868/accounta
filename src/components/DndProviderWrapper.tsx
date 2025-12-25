import { ReactNode, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface DndProviderWrapperProps {
  children: ReactNode;
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  // Use a ref to ensure backend is only created once
  const backendRef = useRef<any>(null);
  
  if (!backendRef.current) {
    backendRef.current = HTML5Backend;
  }
  
  return (
    <DndProvider backend={backendRef.current}>
      {children}
    </DndProvider>
  );
}
