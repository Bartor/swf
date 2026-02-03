import { makeRenderable } from '../utils/rendering-utils';
import { PrepareProps } from '../utils/type-utils';
import {
  Block,
  NodeBlock,
  BlockRenderer,
  BlockRendererFn,
  TextNodeBlock,
  GenericParentNode,
  TextBlock,
  LocallyReferencableNodeBlock,
} from './types';

export const textBlock: TextBlock = (text: string) => {
  const local = new LocallyReferencableNodeBlock(new TextNodeBlock());

  const renderer: BlockRendererFn<Text> = (parent?: GenericParentNode, idx: number = -1) => {
    let hasToRender = false;

    // check if a Node exists...
    const existingNode = parent?.childAt(idx);
    if (existingNode?.name === TextNodeBlock.TEXT_TAG) {
      // ...if yes -> switch to it
      local.node = existingNode as TextNodeBlock;
    } else {
      // ...if no -> create a new element...
      local.node.ref = document.createTextNode(text);
      local.node.parent = parent;
      local.node.root = parent?.root;
      local.node.parent?.addChild(local.node);
      local.node.idx = idx;
      // ...which needs to be rendered
      hasToRender = true;
    }

    const hasTextChanged = local.node.text !== text;

    if (hasTextChanged) {
      local.node.ref.textContent = text;
      local.node.text = text;
    }

    if (hasToRender) {
      return local.node.ref;
    }

    return null;
  };

  return renderer;
};

const makeBlock = <T extends HTMLElement = HTMLElement>(
  tagName: keyof HTMLElementTagNameMap,
): Block<T> => {
  return function block(props = {}, ...children) {
    // maintain references for handler even if `node` changes
    const local = new LocallyReferencableNodeBlock<NodeBlock<T>>(new NodeBlock<T>(tagName));

    const getterProxyHandler = {
      get(_: unknown, prop: unknown) {
        const value = local.node.ref[prop as keyof typeof local.node.ref];
        if (value instanceof Function) {
          return function (...args: unknown[]) {
            return value.apply(local.node.ref, args);
          };
        }

        return undefined;
      },
    };

    const renderer: BlockRendererFn<T> = (parent?: GenericParentNode, idx: number = -1) => {
      let hasToRender = false;

      // check if a Node exists...
      const existingNode = parent?.childAt(idx);
      if (existingNode?.name === tagName) {
        // ...if yes -> switch to it
        local.node = existingNode as NodeBlock<T>;
      } else {
        // if no, make sure to remove the wrong node
        if (existingNode !== undefined) {
          local.node.parent.removeChild(existingNode);
        }

        // ...create a new element...
        local.node.ref = document.createElement(tagName) as T;
        local.node.parent = parent;
        local.node.root = parent?.root;
        local.node.parent?.addChild(local.node);
        local.node.idx = idx;
        // ...which needs to be rendered
        hasToRender = true;
      }

      const havePropsChanged = Object.entries(props).some(
        ([prop, value]) =>
          local.node.currentProps?.[prop as keyof typeof local.node.currentProps] !== value,
      );

      if (local.node.currentProps) {
        const keysToRemove = Object.keys(local.node.currentProps).filter((key) => !(key in props));

        keysToRemove.forEach((key) => {
          local.node.ref[key as keyof PrepareProps<T>] = null;
        });
      }

      if (havePropsChanged || !local.node.currentProps) {
        Object.assign(local.node.ref, props);
        local.node.currentProps = props;
      }

      local.node.trimChildren(children.length);
      const preprocessedChildren = makeRenderable(children);
      preprocessedChildren.forEach((childRenderer, childIdx) => {
        const renderedElement = childRenderer(local.node, childIdx);

        if (renderedElement) {
          local.node.ref.appendChild(renderedElement);
        }
      });

      if (hasToRender) {
        return local.node.ref as T;
      }

      return null;
    };

    local.node.renderer = renderer;

    return new Proxy(renderer, getterProxyHandler) as BlockRenderer<T>;
  };
};

export const br: Block<HTMLLabelElement> = makeBlock('br');
export const button: Block<HTMLButtonElement> = makeBlock('button');
export const div: Block<HTMLDivElement> = makeBlock('div');
export const h1: Block<HTMLElement> = makeBlock('h1');
export const h2: Block<HTMLElement> = makeBlock('h2');
export const h3: Block<HTMLElement> = makeBlock('h3');
export const h4: Block<HTMLElement> = makeBlock('h4');
export const h5: Block<HTMLElement> = makeBlock('h5');
export const h6: Block<HTMLElement> = makeBlock('h6');
export const label: Block<HTMLLabelElement> = makeBlock('label');
export const p: Block<HTMLParagraphElement> = makeBlock('p');
export const span: Block<HTMLSpanElement> = makeBlock('span');
export const strong: Block<HTMLElement> = makeBlock('strong');
