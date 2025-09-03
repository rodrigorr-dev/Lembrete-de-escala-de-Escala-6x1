
import { useState, useEffect } from 'react';

export function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if(item) {
        // Revive dates
        return JSON.parse(item, (key, value) => {
            if ((key === 'firstDayOff' || key === 'birthday' || key === 'start' || key === 'end') && typeof value === 'string' && value) {
                return new Date(value);
            }
            return value;
        });
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
     // This effect ensures that the value is set in local storage
     // after the initial render if it was not already there.
     try {
       const item = window.localStorage.getItem(key);
       if (!item) {
         window.localStorage.setItem(key, JSON.stringify(storedValue));
       }
     } catch (error) {
       console.error("Could not sync initial value to local storage", error);
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  return [storedValue, setValue];
}
