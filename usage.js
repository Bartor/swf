import { br, button, component, div, p, root } from 'swf';

window.addEventListener('load', () => {
  const container = document.getElementById('container');

  const counter = component(
    ({ persist }) =>
      () => {
        const [count, updateCount] = persist(0);
        const add = () => updateCount((count) => count + 1);
        const remove = () => updateCount((count) => count - 1);

        return [
          div(
            {},
            `Count: ${count}`,
            br(),
            button({ onclick: add }, '+'),
            button({ onclick: remove }, '-'),
          ),
        ];
      },
    'counter',
  );

  root(container, counter(), counter());
});
