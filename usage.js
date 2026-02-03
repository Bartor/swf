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

  const counter = component(({ persist, memoize, reduce }) => {
    const initialState = { count: 1 };
    const update = ({ action, payload }, state) => {
      switch (action) {
        case 'add':
          return {
            ...state,
            count: (state.count += payload),
          };
        case 'remove':
          return {
            ...state,
            count: (state.count -= payload),
          };
      }
    };

    return (title, limit) => {
      const [count, updateCount] = persist(1);
      const [state, dispatch] = reduce(initialState, update);

      const add = memoize(
        () => () => {
          updateCount((count) => count + 1);
          dispatch({ action: 'add', payload: 1 });
        },
        [],
      );
      const remove = memoize(
        () => () => {
          updateCount((count) => count - 1);
          dispatch({ action: 'remove', payload: 1 });
        },
        [],
      );

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
          span({ style: state.count > limit || state.count < 0 ? 'color: red' : null }, count),
          br(),
          span({}, repeater(state.count, limit)),
        ),
      ];
    };
  }, 'counter');

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

  const clock = component(({ effect, persist }) => () => {
    const [stop, updateStop] = persist(false);
    const [seconds, updateSeconds] = persist(0);
    const [tempo, updateTempo] = persist(5);

    effect(() => {
      if (stop) {
        return;
      }

      const interval = setInterval(() => updateSeconds((current) => current + 1), [1000 / tempo]);

      return () => clearInterval(interval);
    }, [tempo, stop]);

    return [
      h3({}, 'Effects'),
      div(
        { style: 'display: flex; gap: 8px' },
        button({ onclick: () => updateStop((s) => !s) }, stop ? 'Start' : 'Stop'),
        button({ onclick: () => updateTempo((t) => t + 0.5) }, 'Up tempo'),
        button({ onclick: () => updateTempo((t) => Math.max(t - 0.5, 0.5)) }, 'Down tempo'),
      ),
      span({}, 'Tempo: ', tempo, '/s'),
      br(),
      span({}, 'Elapsed: ', seconds),
    ];
  });

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
      clock(),
    ),
  );
});
