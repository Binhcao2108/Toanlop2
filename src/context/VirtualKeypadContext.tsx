import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ActiveKeypadConfig {
  title?: string;
  value: string;
  onDigit: (d: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit?: () => void;
  anchorRect?: { top: number; left: number; width: number; height: number } | null;
}

interface VirtualKeypadContextType {
  virtualKeypadEnabled: boolean;
  toggleVirtualKeypad: () => void;
  activeKeypad: (ActiveKeypadConfig & { isOpen: boolean }) | null;
  openKeypad: (config: ActiveKeypadConfig) => void;
  updateKeypadValue: (val: string) => void;
  closeKeypad: () => void;
}

const VirtualKeypadContext = createContext<VirtualKeypadContextType | undefined>(undefined);

const STORAGE_KEY = 'toan_lop2_virtual_keypad_enabled';

export const VirtualKeypadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [virtualKeypadEnabled, setVirtualKeypadEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default to TRUE as requested
    } catch {
      return true;
    }
  });

  const [activeKeypad, setActiveKeypad] = useState<(ActiveKeypadConfig & { isOpen: boolean }) | null>(null);

  const toggleVirtualKeypad = () => {
    setVirtualKeypadEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      if (!next) {
        setActiveKeypad(null); // Close keypad immediately if turned off
      }
      return next;
    });
  };

  const openKeypad = (config: ActiveKeypadConfig) => {
    if (!virtualKeypadEnabled) return;
    setActiveKeypad({ ...config, isOpen: true });
  };

  const updateKeypadValue = (val: string) => {
    setActiveKeypad((prev) => (prev ? { ...prev, value: val } : null));
  };

  const closeKeypad = () => {
    setActiveKeypad(null);
  };

  return (
    <VirtualKeypadContext.Provider
      value={{
        virtualKeypadEnabled,
        toggleVirtualKeypad,
        activeKeypad,
        openKeypad,
        updateKeypadValue,
        closeKeypad,
      }}
    >
      {children}
    </VirtualKeypadContext.Provider>
  );
};

export const useVirtualKeypad = (): VirtualKeypadContextType => {
  const context = useContext(VirtualKeypadContext);
  if (!context) {
    throw new Error('useVirtualKeypad must be used within a VirtualKeypadProvider');
  }
  return context;
};
