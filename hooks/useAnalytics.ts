import { event, initialize, pageview } from 'react-ga';

type Event = {
  action: string;
  category: string;
  label?: string;
};
export const useAnalytics = () => {
  return {
    init: (trackingId: string) => {
      initialize(trackingId);
    },
    trackPageViewed: (path?: string) => {
      if (path) {
        pageview(path);
      }
      pageview(window.location.pathname + window.location.search);
    },
    trackEvent: (params: Event) => {
      event(params);
    },
  };
};
