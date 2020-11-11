import { useEffect, useState } from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';

interface Audio {
  analyser: THREE.AudioAnalyser;
  listener: THREE.AudioListener;
  stream: MediaStream;
}

export default function useMicrophone(enabled: boolean) {
  const { camera } = useThree();
  const [audio, setAudio] = useState<Audio>();

  useEffect(() => {
    if (enabled) {
      const listener = new THREE.AudioListener();
      camera.add(listener);

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream: MediaStream) => {
          const audio = new THREE.Audio(listener);

          const { context } = listener;
          const source = context.createMediaStreamSource(stream);
          // @ts-ignore
          audio.setNodeSource(source);
          listener.gain.disconnect();

          const analyser = new THREE.AudioAnalyser(audio, 1024);
          setAudio({ analyser, listener, stream });
        });
    } else {
      if (audio) {
        camera.remove(audio.listener);
        audio.stream.getTracks().forEach(function (track) {
          track.stop();
        });
      }
    }
  }, [enabled]);

  return audio;
}
