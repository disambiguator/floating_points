import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { CSSProperties, useEffect, useState } from 'react';
import { rand, randInt } from 'lib/helpers';
import styles from './blends.module.scss';

type Node = {
  top: number;
  left: number;
  width: number;
  height: number;
  blendMode: CSSProperties['mixBlendMode'];
  color: string;
};

const allBlendModes: CSSProperties['mixBlendMode'][] = [
  // 'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
];

const newNode = (): Node => {
  return {
    top: rand(0, 100),
    left: rand(0, 100),
    width: rand(90, 280),
    height: rand(90, 280),
    blendMode: allBlendModes[randInt(0, allBlendModes.length - 1)],
    color: `rgb(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(0, 255)})`,
  };
};

const NodeComponent = ({ node }: { node: Node }) => {
  const styles: CSSProperties = {
    top: `${node.top}%`,
    left: `${node.left}%`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    position: 'absolute',
    mixBlendMode: node.blendMode,
    backgroundColor: node.color,
    transition: 'top 2s, left 2s',
    transitionTimingFunction: 'ease',
  };

  return <div style={styles}></div>;
};

export const getStaticProps = (() => {
  const nodes = new Array(200).fill(undefined).map(newNode);

  return { props: { nodes } };
}) satisfies GetStaticProps<{
  nodes: Node[];
}>;

export default function Blends({
  nodes,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [nodeState, setNodes] = useState(nodes);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((oldNodes) => {
        return oldNodes.map((oldNode) => {
          return {
            ...oldNode,
            top: rand(0, 100),
            left: rand(0, 100),
          };
        });
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <style global jsx>{`
        html {
          width: 100%;
          height: 100%;
          background: black;
        }
        body {
          margin: 0;
          width: 100%;
          height: 100%;
        }
        #__next {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div className={styles['page']}>
        {nodeState.map((n, i) => (
          <NodeComponent node={n} key={i} />
        ))}
      </div>
    </>
  );
}
