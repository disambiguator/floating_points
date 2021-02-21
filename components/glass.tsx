import React from 'react';
import Page from './page';
import * as p5 from 'p5';
import styled from 'styled-components';
import P5Wrapper from 'react-p5-wrapper';
import { range } from 'lodash';
import GraphLib from '@dagrejs/graphlib';

const FixedSketch = styled(P5Wrapper)`
  canvas {
    position: fixed;
  }
`;

type Vertex = {
  x: number;
  y: number;
  id: number;
};

const distance = 1;
const weight = 1;

function linePoint(
  p: p5,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number,
) {
  const d1 = p.dist(px, py, x1, y1);
  const d2 = p.dist(px, py, x2, y2);

  const lineLen = p.dist(x1, y1, x2, y2);

  const buffer = 0.01;

  return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
}

class Graph {
  edges: Vertex['id'][][] = [];
  graphLib = new GraphLib.Graph({ directed: true });
  vertices: Record<Vertex['id'], Vertex> = {};
  activeVertices: Array<{ id: Vertex['id']; angle: number }> = [];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  drawCycle(p: p5) {
    const cycles: Vertex['id'][][] = GraphLib.alg.findCycles(this.graphLib);

    cycles.find((cycle) => {
      if (cycle.length < 3) return false;

      p.beginShape();
      p.fill('red');
      cycle.forEach((id) => {
        const vertex = this.vertices[id];
        p.vertex(vertex.x, vertex.y);
        p.endShape(p.CLOSE);
        p.frameRate(0);
      });
      return true;
    });
  }

  addVertex(v: Vertex) {
    this.vertices[v.id] = v;
  }

  addEdge(a: Vertex['id'], b: Vertex['id']) {
    if (this.edges[a]) {
      this.edges[a].push(b);
    } else {
      this.edges[a] = [b];
    }

    if (this.edges[b]) {
      this.edges[b].push(a);
    } else {
      this.edges[b] = [a];
    }

    this.graphLib.setEdge(a, b);
    this.graphLib.setEdge(b, a);
  }

  grow(p: p5) {
    this.activeVertices = this.activeVertices.filter(({ id, angle }) => {
      const { x, y } = this.vertices[id];
      const newX = x + distance * p.cos(angle);
      const newY = y + distance * p.sin(angle);

      p.line(x, y, newX, newY);

      if (newX > this.width || newX < 0 || newY > this.height || newY < 0) {
        return false;
      }

      const intersects = () => {
        let item:
          | { originId: Vertex['id']; intersect: Vertex['id'] }
          | undefined;

        this.edges.find((destinations, originId) => {
          const origin = this.vertices[originId];
          const intersect = destinations.find((destId) => {
            const dest = this.vertices[destId];
            return linePoint(p, origin.x, origin.y, dest.x, dest.y, newX, newY)
              ? destId
              : false;
          });

          if (intersect) item = { originId, intersect };

          return intersect;
        });

        return item;
      };

      const intersectingEdge = intersects();
      if (intersectingEdge) {
        p.strokeWeight(7);
        p.point(newX, newY);
        p.strokeWeight(weight);

        this.addEdge(id, intersectingEdge.originId);
        this.addEdge(id, intersectingEdge.intersect);
        // this.removeEdge(intersectingEdge.originId, intersectingEdge.intersect);

        // const origin = this.vertices[intersectingEdge.originId];
        // const destination = this.vertices[intersectingEdge.intersect];
        // p.stroke('red');
        // p.line(origin.x, origin.y, destination.x, destination.y);
        // p.frameRate(0);

        this.drawCycle(p);
        return false;
      }

      this.vertices[id].x = newX;
      this.vertices[id].y = newY;

      return true;
    });
  }
}

const Bendy = () => {
  const sketch = (p: p5) => {
    const width = p.windowWidth;
    const height = p.windowHeight;

    let i = 0;
    let id = 0;
    const graph = new Graph(width, height);

    function setGradient(c1: p5.Color, c2: p5.Color) {
      p.noFill();
      for (let x = -height; x < width; x++) {
        const inter = p.map(x, -height, width, 0, 1);
        const c = p.lerpColor(c1, c2, inter);
        p.stroke(c);
        p.line(x, 0, x + height, height);
      }
    }

    p.setup = () => {
      p.createCanvas(width, height);
      p.frameRate(60);
      p.strokeWeight(weight);

      const c1 = p.color(8, 38, 69);
      const c2 = p.color(8, 18, 69);
      setGradient(c1, c2);

      p.stroke(219, 193, 96);
    };

    p.draw = () => {
      if (i++ % 20 === 0) {
        addPoint(Math.random() * width, Math.random() * height);
      }

      graph.drawCycle(p);

      graph.grow(p);

      // if (activeCracks.length === 0) {
      //   p.frameRate(0);
      //   console.log('goodbye');
      //   return;
      // }
    };

    const addPoint = (x: number, y: number) => {
      p.frameRate(60);

      const offset = Math.random() * 360;

      const origin = {
        x,
        y,
        id: id++,
      };
      graph.addVertex(origin);

      // const points = 3 + Math.floor(Math.random() * 3);

      // Fix to 3 right now while I figure this out
      const points = 3;

      range(points).forEach((n) => {
        const angle = p.radians((n * 360) / points + offset);
        const c = {
          x,
          y,
          id: id++,
        };

        graph.addVertex(c);
        graph.activeVertices.push({ id: c.id, angle });
        graph.addEdge(origin.id, c.id);
      });
    };

    p.mouseClicked = () => {
      addPoint(p.mouseX, p.mouseY);
    };
  };

  return <FixedSketch sketch={sketch} />;
};

export default function WalkerPage() {
  return (
    <Page>
      <Bendy />
    </Page>
  );
}
