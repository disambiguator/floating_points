import dynamic from 'next/dynamic';

export default dynamic(() => import('./rings copy'), {
  ssr: false,
});
