import { useThree } from '@react-three/fiber';
import { mean } from 'lodash';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

export type Audio = {
  analyser: THREE.AudioAnalyser;
  listener: THREE.AudioListener;
};

export type Spectrum = {
  volume: number;
  bass: number;
  midrange: number;
  treble: number;
  frequencyData: number[];
};

export const SAMPLE_LENGTH = 512;
export const analyseSpectrum = (
  audio: Audio,
  threshold = 0,
  scale = 1,
): Spectrum => {
  const { analyser } = audio;
  const bass: number[] = [];
  const midrange: number[] = [];
  const treble: number[] = [];
  let volume = 0;
  const frequencyData: number[] = [];
  const analyserData = analyser.getFrequencyData();
  const fftSize = analyser.analyser.frequencyBinCount * 2;

  for (let i = 0; i < analyserData.length; i++) {
    const frequency = (i * audio.listener.context.sampleRate) / fftSize;

    const value = (analyserData[i] > threshold ? analyserData[i] : 0) * scale;

    if (frequency >= 20 && frequency <= 250) {
      bass.push(value);
    } else if (frequency <= 4000) {
      midrange.push(value);
    } else {
      treble.push(value);
    }

    frequencyData.push(value);
    volume += value;
  }
  // subBass 20 - 60 hz
  // bass 60 - 250 hz
  // low midrange 250 - 500 hz
  // midrange 500 hz - 2 kHz
  // upper midrange 2 - 4 khz
  // presence 4 khz - 6 khz
  // brilliance 6 khz - 20 khz

  volume = volume / analyser.analyser.frequencyBinCount;

  return {
    frequencyData,
    volume,
    bass: mean(bass) * 0.3,
    midrange: mean(midrange) * 0.5,
    treble: mean(treble),
  };
};

export const useAudioUrl = (url: string, enabled = true) => {
  const camera = useThree((t) => t.camera);
  const [audio, setAudio] = useState<Audio>();

  useEffect(() => {
    if (!enabled) return;

    const audioLoader = new THREE.AudioLoader();
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const sound = new THREE.Audio(listener);

    audioLoader.load(url, (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      sound.play();

      const analyser = new THREE.AudioAnalyser(sound, 32);
      setAudio({ analyser, listener });
    });
    return () => {
      camera.remove(listener);
      if (sound.source) sound.stop();
    };
  }, [enabled, camera, url]);

  return audio;
};

export function useMicrophone(enabled = true) {
  const camera = useThree((t) => t.camera);
  const [audio, setAudio] = useState<Audio>();
  const [stream, setStream] = useState<MediaStream>();

  useEffect(() => {
    if (enabled) {
      const listener = new THREE.AudioListener();
      camera.add(listener);

      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream: MediaStream) => {
          const audio = new THREE.Audio(listener);

          const { context } = listener;
          const source = context.createMediaStreamSource(
            stream,
          ) as unknown as AudioBufferSourceNode;
          audio.setNodeSource(source);
          listener.gain.disconnect();

          const analyser = new THREE.AudioAnalyser(audio, 1024);
          setAudio({ analyser, listener });
          setStream(stream);
        })
        .catch((e: unknown) => {
          throw e;
        });
    } else if (audio) {
      camera.remove(audio.listener);
      stream?.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    // TODO fix
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, enabled]);

  return audio;
}
