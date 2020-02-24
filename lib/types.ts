import * as p5 from 'p5';
import { ComponentType } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

export interface P5WrapperProps {
  sketch: (p: p5) => void;
}
export type P5WrapperComponent = ComponentType<P5WrapperProps>;
