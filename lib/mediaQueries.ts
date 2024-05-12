import { useMediaQuery } from 'react-responsive';

export const useIsMobile = () =>
  useMediaQuery({
    query: '(max-width: 480px)',
  });
