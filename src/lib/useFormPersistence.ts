import { useState, useEffect, useCallback } from 'react';

interface FormData {
  [key: string]: unknown;
}

interface UIState {
  [key: string]: unknown;
}

export function useFormPersistence<T extends FormData, U extends UIState = Record<string, never>>(
  initialData: T,
  storageKey: string,
  dependencies: unknown[] = [],
  initialUIState: U = {} as U
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [uiState, setUIState] = useState<U>(initialUIState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      const savedUIState = localStorage.getItem(`${storageKey}-ui`);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      }
      
      if (savedUIState) {
        const parsedUIState = JSON.parse(savedUIState);
        setUIState(prev => ({ ...prev, ...parsedUIState }));
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Save form data to localStorage whenever formData changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    }
  }, [formData, storageKey, isLoaded]);

  // Save UI state to localStorage whenever uiState changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(`${storageKey}-ui`, JSON.stringify(uiState));
      } catch (error) {
        console.error('Error saving UI state to localStorage:', error);
      }
    }
  }, [uiState, storageKey, isLoaded]);

  // Clear localStorage when dependencies change (e.g., when user completes application)
  useEffect(() => {
    return () => {
      // This cleanup function will run when the component unmounts
      // or when dependencies change
    };
  }, [dependencies]);

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUIState = useCallback((updates: Partial<U>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-ui`);
      setFormData(initialData);
      setUIState(initialUIState);
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  }, [storageKey, initialData, initialUIState]);

  const resetFormData = useCallback(() => {
    setFormData(initialData);
    setUIState(initialUIState);
  }, [initialData, initialUIState]);

  return {
    formData,
    uiState,
    updateFormData,
    updateUIState,
    clearFormData,
    resetFormData,
    isLoaded
  };
}
