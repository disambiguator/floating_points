import { type MutableRefObject, useCallback, useRef } from 'react';

export const useRefState = <T>(
  initial: T,
): [MutableRefObject<T>, (t: T) => void] => {
  const v = useRef<T>(initial);
  const setV = useCallback((n: T) => {
    v.current = n;
  }, []);
  return [v, setV];
};
