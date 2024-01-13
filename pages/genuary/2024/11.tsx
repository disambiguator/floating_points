import { ScreenQuad } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, GLSL3, Vector2 } from 'three';
import Page from 'components/page';
import { FiberScene } from 'components/scene';
import { rand } from 'lib/helpers';
import fragmentShader from './11.frag';

type Shape = {
  position: Vector2;
  size: Vector2;
  color: Color;
  repeat: number;
  speed: Vector2;
};

const randomColor = () => {
  const color = new Color();
  color.setHSL(Math.random(), Math.random() * 0.9, Math.random());
  return color;
};

const generateShapes = () =>
  new Array(100).fill(0).map(
    (): Shape => ({
      position: new Vector2(rand(-1, 1), rand(-1, 1)),
      size: new Vector2(rand(0.01, 0.05), rand(0.01, 0.1)),
      color: randomColor(),
      // color: sample(palette)!,
      repeat: rand(0, 0.3),
      speed: new Vector2(rand(-0.1, 0.1), rand(-0.1, 0.1)),
    }),
  );

const shader = {
  uniforms: {
    aspect: { value: 0 },
    time: { value: 0 },
    shapes: { value: generateShapes() },
  },
  vertexShader: `
      out vec2 vUV;
      void main() {
        vUV = position.xy;
        gl_Position = vec4(position, 1);
      }
      `,
  fragmentShader,
};

const Albers = () => {
  const viewport = useThree((t) => t.viewport);

  useFrame(({ clock }) => {
    shader.uniforms.time.value = clock.elapsedTime;
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        args={[shader]}
        uniforms-aspect-value={viewport.aspect}
        glslVersion={GLSL3}
      />
    </ScreenQuad>
  );
};

export default function CubesPage() {
  return (
    <Page>
      <div style={{ height: '95vh', width: '60vh' }}>
        <FiberScene
          camera={{
            far: 10000,
            position: [0, 0, 300],
          }}
          controls
        >
          <Albers />
        </FiberScene>
      </div>
    </Page>
  );
}
