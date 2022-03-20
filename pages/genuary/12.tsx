import * as p5 from 'p5';
import { ReactP5Wrapper } from 'components/p5_wrapper';
import Page from 'components/page';

type Square = {
  x: number;
  y: number;
  growing: boolean;
  size: number;
  id: number;
  color: string;
};

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;
    const squares: Square[] = [];

    const newSquare = (): Square => {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(
        16,
      )}`;
      const square = {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0,
        growing: true,
        id: Math.random(),
        color: randomColor,
      };
      return square;
    };

    p.setup = () => {
      p.createCanvas(width, height);
      p.background('#f4f0db');
      p.frameRate(60);
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
      squares.push(newSquare());
    };

    const rectRect = (
      r1x: number,
      r1y: number,
      r1w: number,
      r1h: number,
      r2x: number,
      r2y: number,
      r2w: number,
      r2h: number,
    ): boolean => {
      // are the sides of one rectangle touching the other?

      if (
        r1x + r1w >= r2x && // r1 right edge past r2 left
        r1x <= r2x + r2w && // r1 left edge past r2 right
        r1y + r1h >= r2y && // r1 top edge past r2 bottom
        r1y <= r2y + r2h
      ) {
        // r1 bottom edge past r2 top
        return true;
      }
      return false;
    };

    p.draw = () => {
      squares.forEach((s) => {
        if (!s.growing) return;

        // checking all of myRectCorner to see if any are inside of otherRect
        s.growing = !squares.some((other) => {
          if (other.id === s.id) return false;
          return rectRect(
            s.x - s.size / 2,
            s.y - s.size / 2,
            s.size,
            s.size,
            other.x - other.size / 2,
            other.y - other.size / 2,
            other.size,
            other.size,
          );
        });

        if (!s.growing) {
          squares.push(newSquare());
          return;
        }

        s.size++;
        p.fill(s.color);
        p.rect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
      });
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};
export default function BendyPage() {
  return (
    <Page>
      <Bendy />
    </Page>
  );
}
