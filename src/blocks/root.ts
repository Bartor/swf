import { RenderBlock, Node } from './types';

export const root =
  (el: HTMLElement) =>
  (...children: RenderBlock[]) => {
    const rootNode: Node = {
      ref: el,
      currentProps: {},
      children: [],
    };

    const childEls = children.map((child) => child(rootNode));
    childEls.forEach((childEl) => el.appendChild(childEl));
  };
