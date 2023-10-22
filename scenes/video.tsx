import { Box, useVideoTexture } from '@react-three/drei';
import React from 'react';
import assetUrl from 'lib/assetUrl';
import { type Config } from 'lib/store';

function VideoMaterial({ src }: { src: string }) {
  const texture = useVideoTexture(src);

  return <meshBasicMaterial map={texture} toneMapped={false} />;
}

const Video = () => {
  return (
    <Box>
      <VideoMaterial src={assetUrl('/sears.mp4')} />
    </Box>
  );
};

const Halloween = React.memo(function Dusen() {
  return (
    <>
      <React.Suspense fallback={null}>
        <Video />
      </React.Suspense>
    </>
  );
});

export const videoConfig: Config = {
  name: 'video',
  Contents: Halloween,
  params: {},
};
