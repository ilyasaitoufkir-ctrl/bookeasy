import { createContext, useContext, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  primaryColor: string;
  secondaryColor: string;
  businessName: string;
  businessLogo?: string;
  setTheme: (primary: string, secondary: string, name: string, logo?: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: '#1e3a5f',
  secondaryColor: '#3068bc',
  businessName: 'BookEasy',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColor]     = useState('#1e3a5f');
  const [secondaryColor, setSecondaryColor] = useState('#3068bc');
  const [businessName, setBusinessName]     = useState('BookEasy');
  const [businessLogo, setBusinessLogo]     = useState<string | undefined>();

  const setTheme = (primary: string, secondary: string, name: string, logo?: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    setBusinessName(name);
    setBusinessLogo(logo);
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-secondary', secondary);
  };

  return (
    <ThemeContext.Provider value={{ primaryColor, secondaryColor, businessName, businessLogo, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
