import { mean } from 'lodash';
import { useEffect, useState } from 'react';
import { useThree } from 'react-three-fiber';
import * as THREE from 'three';

interface Audio {
  analyser: THREE.AudioAnalyser;
  listener: THREE.AudioListener;
}

export interface Spectrum {
  subBass: number;
  volume: number;
  bass: number;
  midrange: number;
  treble: number;
  frequencyData: number[];
}

export const analyseSpectrum = (audio: Audio): Spectrum => {
  const { analyser } = audio;
  const subBass: number[] = [];
  const bass: number[] = [];
  const midrange: number[] = [];
  const treble: number[] = [];
  let volume = 0;
  const frequencyData: number[] = [];
  const analyserData = analyser.getFrequencyData();

  for (let i = 0; i < analyserData.length; i++) {
    const frequency =
      ((i + 1) * audio.listener.context.sampleRate) /
      2 /
      analyser.analyser.frequencyBinCount;
    if (frequency > 15000) break;

    const value = analyserData[i];

    if (frequency >= 20 && frequency <= 60) {
      subBass.push(value);
    } else if (frequency <= 250) {
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

  return {
    frequencyData,
    volume: volume / 2 / analyser.analyser.frequencyBinCount,
    bass: mean(bass) / 2,
    subBass: mean(subBass) / 2,
    midrange: mean(midrange) / 2,
    treble: mean(treble) / 2,
  };
};

export const useAudioUrl = (url: string, enabled = true) => {
  const { camera } = useThree();
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
      camera?.children && camera.remove(listener);
      sound.source && sound.stop();
    };
  }, [enabled]);

  return audio;
};

export function useMicrophone(enabled: boolean) {
  const { camera } = useThree();
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
          const source = context.createMediaStreamSource(stream);
          // @ts-ignore
          audio.setNodeSource(source);
          listener.gain.disconnect();

          const analyser = new THREE.AudioAnalyser(audio, 1024);
          setAudio({ analyser, listener });
          setStream(stream);
        });
    } else {
      if (audio) {
        camera.remove(audio.listener);
        stream &&
          stream.getTracks().forEach(function (track) {
            track.stop();
          });
      }
    }
  }, [enabled]);

  return audio;
}
