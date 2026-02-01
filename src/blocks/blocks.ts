import { Block, ContainingBlock, Node, RenderBlock } from './types';

export const text: Block<Text> = function (text: string) {
  const el = document.createTextNode(text);

  return function () {
    return () => el;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};

const makeBlock = <T extends HTMLElement = HTMLElement>(
  tagName: keyof HTMLElementTagNameMap,
): Block<T> =>
  function (props) {
    const el = document.createElement(tagName);
    Object.assign(el, props);

    // proxy handler which allows to call any el method on returned blockFn
    const handler = {
      get: function (target: unknown, prop: unknown) {
        const value = el[prop as keyof typeof el];
        if (value instanceof Function) {
          return function (...args: unknown[]) {
            return value.apply(el, args);
          };
        }

        return undefined;
      },
    };

    function blockFn(...children: RenderBlock[]) {
      return function (parent) {
        const elNode: Node<T> = {
          parent,
          ref: el as T,
          currentProps: props,
          children: [],
        };

        parent?.children.push(elNode);
        const childEls = children.map((child) => child(elNode));
        childEls.forEach((childEl) => el.appendChild(childEl));

        return el;
      } as RenderBlock<T>;
    }

    return new Proxy(blockFn, handler) as ContainingBlock<T>;
  };

export const div: Block<HTMLDivElement> = makeBlock('div');
export const span: Block<HTMLDivElement> = makeBlock('span');
