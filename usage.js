import { br, button, component, div, h2, h3, p, root, span, strong } from 'swf';

window.addEventListener('load', () => {
  const pageWidth = '400px';
  const staticContainer = document.getElementById('staticContainer');
  const staticExample = div(
    { style: `background-color: beige; padding: 10px; width: ${pageWidth}` },
    h2({}, 'Hello!'),
    p(
      {},
      'This is a ',
      strong({}, 'statically'),
      ' rendered part of the page!',
      br(),
      'It uses SWF building blocks to make HTML-in-JS writing much easier',
      br(),
      'You can even make interactable elements like ',
      strong({ onclick: () => alert('Hello!') }, 'this (click me)'),
      '!',
    ),
  )();
  staticContainer.appendChild(staticExample);

  const container = document.getElementById('container');

  const hello = component(
    () => (name) => {
      return [span({}, 'Hello, '), strong({}, name), span({}, '!'), br()];
    },
    'hello',
  );

  const repeater = component(
    ({ memoize }) =>
      (times, limit) => {
        const header = memoize(() => {
          switch (true) {
            case times < 0:
              return 'What';
            case times < 5:
              return 'Go on...';
            case times < limit:
              return 'Getting close';
            default:
              return 'Reached the limit!';
          }
        }, [times, limit]);

        return [
          p({}, header),
          ...Array.from({ length: Math.min(times, limit) }, (_, idx) =>
            hello(`Element #${idx + 1}`),
          ),
        ];
      },
    'repeater',
  );

  const counter = component(
    ({ persist, memoize }) =>
      (title, limit) => {
        const [count, updateCount] = persist(1);
        const add = memoize(() => () => updateCount((count) => count + 1), [updateCount]);
        const remove = memoize(() => () => updateCount((count) => count - 1), [updateCount]);

        return [
          div(
            {},
            h3({}, title),
            div(
              { style: 'display: flex; gap: 8px;' },
              button({ onclick: remove }, '-'),
              button({ onclick: add }, '+'),
            ),
            'Count: ',
            span({ style: count > limit || count < 0 ? 'color: red' : '' }, count),
            br(),
            span({}, repeater(count, limit)),
          ),
        ];
      },
    'counter',
  );

  const description = p(
    {},
    'This is an interactive example; it uses ',
    strong({}, 'local state management'),
    ' as well as ',
    strong({}, 'memoization of methods'),
    ' for improved performance, as part of ',
    strong({}, 'custom, nested components'),
    '.',
  );

  root(
    container,
    div(
      { style: `background-color: beige; padding: 10px; width: ${pageWidth}` },
      h2({}, 'Interactive example'),
      description,
      div(
        { style: 'display: grid; grid-template-columns: auto auto;' },
        counter('First counter', 10),
        counter('Second counter', 5),
      ),
    ),
  );
});
