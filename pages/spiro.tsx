import { useRouter } from 'next/router';
import React from 'react';
import Mixer from '../components/mixer';
import { initPositions, spiroConfig } from '../components/spiro';
import { useStateUpdate } from '../lib/store';

export default function SpiroPage() {
  const router = useRouter();
  const urlSeeds = router.query.seeds as string | undefined;

  useStateUpdate({
    env: {
      ...spiroConfig,
      params: {
        ...spiroConfig.params,
        seeds: urlSeeds ? JSON.parse(urlSeeds) : initPositions(),
      },
    },
  });

  return <Mixer />;
}
