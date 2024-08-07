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

export const videoConfig = {
  name: 'video',
  Contents: Video,
} as const satisfies Config;
