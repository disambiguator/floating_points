import { event, initialize, pageview } from 'react-ga';

interface Event {
  action: string;
  category: string;
  label?: string;
}
export const useAnalytics = () => {
  return {
    init: (trackingId: string) => {
      initialize(trackingId);
    },
    trackPageViewed: (path?: string) => {
      if (path) {
        return pageview(path);
      }
      return pageview(window.location.pathname + window.location.search);
    },
    trackEvent: (params: Event) => {
      event(params);
    },
  };
};
