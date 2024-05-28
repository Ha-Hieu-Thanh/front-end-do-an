import { createContext, useContext } from 'react';

interface IAppContext {}

const AppContext = createContext<IAppContext | null>(null);
export const AppProvider = AppContext.Provider;

export const useAppContext = () => {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error('use useAppContext in AppProvider');
  }

  return value;
};
