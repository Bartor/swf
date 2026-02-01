import { text, div, root, span } from 'swf';

window.addEventListener('load', () => {
  const container = document.getElementById('container');

  root(container)(
    div({ className: 'parent-class' })(
      text('parent text ')(),
      span({ style: 'background-color:red;' })(text('children text')()),
    ),
  );
});
