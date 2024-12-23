import { NextPageContext } from 'next';
import React from 'react';
import { rand, randInt } from 'lib/helpers';
import styles from './blends.module.scss';

type Node = {
  top: number;
  left: number;
  width: number;
  height: number;
  blendMode: React.CSSProperties['mixBlendMode'];
  color: string;
};

const allBlendModes: React.CSSProperties['mixBlendMode'][] = [
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

const NodeComponent = ({ node, images }: { node: Node; images: boolean }) => {
  const styles: React.CSSProperties = {
    top: `${node.top}%`,
    left: `${node.left}%`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    position: 'absolute',
    mixBlendMode: node.blendMode,
    backgroundColor: images ? undefined : node.color,
    transition: 'top 2s, left 2s',
    transitionTimingFunction: 'ease',
  };

  if (images) {
    const imgSrc = `http://loremflickr.com/${Math.floor(node.width)}/${Math.floor(node.height)}`;

    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={imgSrc} style={styles} />;
  }
  return <div style={styles}></div>;
};

export default function Blends({
  nodes,
  images,
}: {
  nodes: Node[];
  images: boolean;
}) {
  const [nodeState, setNodes] = React.useState(nodes);

  React.useEffect(() => {
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
          <NodeComponent node={n} key={i} images={images} />
        ))}
      </div>
    </>
  );
}

Blends.getInitialProps = (ctx: NextPageContext) => {
  const nodes = new Array(200).fill(undefined).map(newNode);

  return { nodes, images: !!ctx.query['images'] };
};
