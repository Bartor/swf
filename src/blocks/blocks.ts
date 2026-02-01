import { Block, Node } from './types';

export const text: Block<Text> = (text: string) => {
  const el = document.createTextNode(text);

  return () => () => el;
};

const makeBlock =
  <T extends HTMLElement = HTMLElement>(tagName: keyof HTMLElementTagNameMap): Block<T> =>
  (props) => {
    const el = document.createElement(tagName);
    Object.assign(el, props);

    return (...children) => {
      return (parent) => {
        const elNode: Node<T> = {
          parent,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref: el as any,
          currentProps: props,
          children: [],
        };

        parent?.children.push(elNode);
        const childEls = children.map((child) => child(elNode));
        childEls.forEach((childEl) => el.appendChild(childEl));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return el as any;
      };
    };
  };

export const div: Block<HTMLDivElement> = makeBlock('div');
export const span: Block<HTMLDivElement> = makeBlock('span');
