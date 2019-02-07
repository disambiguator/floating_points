const pages = [
  { name: 'Pixelsorting', path: '/pixel_sort' },
  { name: 'Spirographs', path: '/spiro' },
  { name: 'Visualizer', path: '/visualizer' },
  { name: 'Scatter', path: '/scatter' },
  { name: 'Cubes', path: '/cubes' },
]

export default () => (
  <ul>
    {pages.map((p) => (
      <li>
        <a href={p.path}>{p.name}</a>
      </li>
    ))}
  </ul>
);
