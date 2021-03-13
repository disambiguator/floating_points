import React, { useState } from 'react';
import { barsConfig } from '../components/bars';
import Mixer from '../components/mixer';
import Page from '../components/page';
import { useStateUpdate } from '../lib/store';

export default function BarsPage() {
  useStateUpdate({
    zoomThreshold: 2,
    trails: 125,
    audioEnabled: true,
    env: barsConfig,
  });
  const [started, start] = useState(false);

  return started ? (
    <Mixer />
  ) : (
    <Page onClick={() => start(true)}>
      <div>Click to start</div>
    </Page>
  );
}
