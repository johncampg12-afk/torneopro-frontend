import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'organizer';

export interface OnboardingData {
  fullName: string;
  username: string;
  city: string;
  photo?: File;
  role: UserRole;
}

interface OnboardingContextType {
  data: OnboardingData;
  setData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
}

const defaultData: OnboardingData = {
  fullName: '',
  username: '',
  city: '',
  role: 'user',
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<OnboardingData>(defaultData);

  const setData = (partial: Partial<OnboardingData>) => {
    setDataState(prev => ({ ...prev, ...partial }));
  };

  const reset = () => setDataState(defaultData);

  return (
    <OnboardingContext.Provider value={{ data, setData, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}