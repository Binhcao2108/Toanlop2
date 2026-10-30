import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

export interface ActiveKeypadConfig {
  title?: string;
  value: string;
  maxLength?: number;
  onChange?: (val: string) => void;
  onDigit?: (d: string) => void;
  onDelete?: () => void;
  onClear?: () => void;
  onSubmit?: (currentVal?: string) => void;
  targetEl?: HTMLElement | null;
  anchorRect?: { top: number; left: number; width: number; height: number } | null;
}

interface VirtualKeypadContextType {
  virtualKeypadEnabled: boolean;
  toggleVirtualKeypad: () => void;
  activeKeypad: (ActiveKeypadConfig & { isOpen: boolean }) | null;
  keypadHeight: number;
  setKeypadHeight: (h: number) => void;
  openKeypad: (config: ActiveKeypadConfig) => void;
  updateKeypadValue: (val: string) => void;
  getKeypadValue: () => string;
  closeKeypad: () => void;
}

const VirtualKeypadContext = createContext<VirtualKeypadContextType | undefined>(undefined);

const STORAGE_KEY = 'toan_lop2_virtual_keypad_enabled';

export const VirtualKeypadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [virtualKeypadEnabled, setVirtualKeypadEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [activeKeypad, setActiveKeypad] = useState<(ActiveKeypadConfig & { isOpen: boolean }) | null>(null);
  const activeValueRef = useRef<string>('');
  const [keypadHeight, setKeypadHeight] = useState<number>(0);

  const toggleVirtualKeypad = () => {
    setVirtualKeypadEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      if (!next) {
        activeValueRef.current = '';
        setActiveKeypad(null);
      }
      return next;
    });
  };

  const openKeypad = (config: ActiveKeypadConfig) => {
    if (!virtualKeypadEnabled) return;
    activeValueRef.current = config.value || '';
    setActiveKeypad({ ...config, isOpen: true });

    const el =
      config.targetEl ||
      (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);

    if (el && typeof el.scrollIntoView === 'function') {
      setTimeout(() => {
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {
          el.scrollIntoView();
        }
      }, 90);
    }
  };

  const updateKeypadValue = (val: string) => {
    activeValueRef.current = val;
    setActiveKeypad((prev) => (prev ? { ...prev, value: val } : null));
  };

  const getKeypadValue = () => activeValueRef.current;

  const closeKeypad = () => {
    activeValueRef.current = '';
    setActiveKeypad(null);
  };

  return (
    <VirtualKeypadContext.Provider
      value={{
        virtualKeypadEnabled,
        toggleVirtualKeypad,
        activeKeypad,
        keypadHeight,
        setKeypadHeight,
        openKeypad,
        updateKeypadValue,
        getKeypadValue,
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
