import React from 'react';

export const useRefState = <T>(
  initial: T,
): [React.MutableRefObject<T>, (t: T) => void] => {
  const v = React.useRef<T>(initial);
  const setV = React.useCallback((n: T) => {
    v.current = n;
  }, []);
  return [v, setV];
};
