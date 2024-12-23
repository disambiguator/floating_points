import { makeNoise2D } from 'open-simplex-noise';
import React from 'react';
import styles from './7.module.scss';

const squares = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛'];

const noiseStart = 70;
const growStart = 100;
const maxNoiseRows = 60;

const noise = makeNoise2D(1234);

const noiseEmoji = (index: number): string[] => {
  const width = index < growStart ? 5 : Math.min(index - growStart + 5, 60);
  return new Array(width).fill(undefined).map((_, i) => {
    return squares[Math.floor((noise(index / 10, i / 10) + 1) * 4)];
  });
};

const generateLine = (index: number) => {
  let squares = ['⬛', '⬛', '⬛', '⬛', '⬛'];
  if (index < 5) {
    // do nothing
  } else if (index < 20) {
    squares[index % 5] = '🟨';
  } else if (index < 40) {
    squares[index % 5] = '🟨';
    squares[(index + 1) % 5] = '🟩';
  } else if (index < 60) {
    squares[index % 5] = '🟨';
    squares[(index + 1) % 5] = '🟩';
    squares[(index + 2) % 5] = '🟨';
  } else if (index < 70) {
    squares[index % 5] = '🟨';
    squares[(index + 1) % 5] = '🟩';
    squares[(index + 2) % 5] = '🟨';
    squares[(index + 3) % 5] = '🟩';
  } else if (index < noiseStart) {
    squares = squares.map((_, i) => ((index + i) % 2 === 0 ? '🟩' : '🟨'));
  } else {
    squares = noiseEmoji(index);
  }

  return squares.join(' ');
};

function Wordle({ height }: { height: number; width: number }) {
  const [lines, setLines] = React.useState<React.JSX.Element[]>([]);
  const numLines = React.useMemo(() => Math.floor((height - 1) / 32), [height]);
  const lineIndex = React.useRef<number>(0);
  const style: React.CSSProperties = React.useMemo(() => {
    const l = (height - 1) / Math.max(lines.length, numLines);

    const letterSpacing = Math.max(
      0.1 - (lines.length <= numLines ? 0 : (lines.length - numLines) * 0.2),
      -2,
    );
    const lineHeight = Math.max(
      l - (lines.length <= numLines ? 0 : maxNoiseRows / height),
      height / maxNoiseRows,
    );

    const fontSize =
      lineHeight *
      (lines.length <= numLines
        ? 0.75
        : 0.75 + (0.25 * lines.length) / maxNoiseRows);
    return {
      fontSize: `${fontSize}px`,
      letterSpacing: `${letterSpacing}px`,
      lineHeight: `${lineHeight}px`,
    };
  }, [lines.length, height, numLines]);

  const animate = React.useCallback(() => {
    const i = lineIndex.current++;

    if (i < 6) return;
    if (i === 6) {
      setLines([
        <div key={0}>{generateLine(0)}</div>,
        <div key={1}>{generateLine(1)}</div>,
        <div key={2}>{generateLine(2)}</div>,
        <div key={3}>{generateLine(3)}</div>,
        <div key={4}>{generateLine(4)}</div>,
        <div key={5}>{generateLine(5)}</div>,
      ]);
      return;
    }
    if (i > 6 && i < 12) return;
    if (i === 12) {
      setLines((lines) => [
        ...lines,
        <div key={6}>{generateLine(6)}</div>,
        <div key={7}>{generateLine(7)}</div>,
        <div key={8}>{generateLine(8)}</div>,
        <div key={9}>{generateLine(9)}</div>,
        <div key={10}>{generateLine(10)}</div>,
        <div key={11}>{generateLine(11)}</div>,
      ]);
      return;
    }
    if (i > 12 && i < 18) return;

    const n = i < growStart ? -numLines : -maxNoiseRows;
    // console.log(i, growStart, -numLines.current, -maxNoiseRows, n);
    setLines((lines) => {
      return [...lines, <div key={i}>{generateLine(i)}</div>].slice(n);
    });
  }, [numLines]);

  React.useEffect(() => {
    const animateInterval = window.setInterval(animate, 100);

    return () => {
      clearInterval(animateInterval);
    };
  }, [animate]);
  return (
    <div className={styles['root']} style={style}>
      {lines}
    </div>
  );
}

export default function WorldlePage() {
  const [size, setSize] = React.useState<[number, number] | undefined>();
  React.useEffect(() => {
    setSize([innerHeight, innerWidth]);
  }, []);

  return size ? <Wordle height={size[0]} width={size[1]} /> : null;
}
