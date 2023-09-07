import React, { useState } from 'react';
import Mixer from 'components/mixer';
import Page from 'components/page';

export default function BarsPage() {
  const [started, start] = useState(false);

  return started ? (
    <Mixer name="bars" />
  ) : (
    <Page
      onClick={() => {
        start(true);
      }}
    >
      <div>Click to start</div>
    </Page>
  );
}
