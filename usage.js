import { text, div, root, span } from 'swf';

window.addEventListener('load', () => {
  const container = document.getElementById('container');

  // we can interact with internal DOM methods freely if we want to
  const interactiveSpan = span();
  interactiveSpan.addEventListener('click', () => alert('Hello!'));

  root(container)(
    // element calls create a simple tree
    div({ className: 'parent-class' })(
      text('parent text ')(),
      span({ style: 'background-color:red;' })(text('children text')()),
      interactiveSpan(text(' click me!')()),
    ),
  );
});
