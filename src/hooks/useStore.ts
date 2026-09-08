import { useState, useEffect } from 'react';
import { store, AppState } from '../services/store';

export function useStore(): AppState & { store: typeof store } {
  const [state, setState] = useState<AppState>(() => store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...state,
    store,
  };
}
