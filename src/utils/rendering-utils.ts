import { BlockRendererFn, Renderable, textBlock } from '../blocks';

export const makeRenderable = (children: Renderable[]): BlockRendererFn[] =>
  children.map((child) => {
    if (typeof child === 'number') {
      return textBlock(child.toString());
    }

    if (typeof child === 'string') {
      return textBlock(child);
    }

    return child;
  });
