import { makeRenderable } from '../utils/rendering-utils';
import {
  Block,
  NodeBlock,
  BlockRenderer,
  BlockRendererFn,
  TextNodeBlock,
  GenericParentNode,
  TextBlock,
  LocallyReferenableNodeBlock,
} from './types';

export const textBlock: TextBlock = (text: string) => {
  const local = new LocallyReferenableNodeBlock(new TextNodeBlock());

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
    const local = new LocallyReferenableNodeBlock<NodeBlock<T>>(new NodeBlock<T>(tagName));

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
        // ...if no -> create a new element...
        local.node.ref = document.createElement(tagName) as T;
        local.node.parent = parent;
        local.node.parent?.addChild(local.node);
        local.node.idx = idx;
        // ...which needs to be rendered
        hasToRender = true;
      }

      const havePropsChanged = Object.entries(props).some(
        ([prop, value]) =>
          local.node.currentProps?.[prop as keyof typeof local.node.currentProps] !== value,
      );

      if (havePropsChanged) {
        Object.assign(local.node.ref, props);
        local.node.currentProps = props;
        hasToRender = true;
      }

      const preprocessedChildren = makeRenderable(children);
      const renderedChildren = preprocessedChildren.map((child, idx) => child(local.node, idx));
      renderedChildren.forEach((child) => {
        if (child !== null) {
          local.node.ref.appendChild(child);
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

export const div: Block<HTMLDivElement> = makeBlock('div');
export const span: Block<HTMLSpanElement> = makeBlock('span');
export const p: Block<HTMLParagraphElement> = makeBlock('p');
export const button: Block<HTMLButtonElement> = makeBlock('button');
export const label: Block<HTMLLabelElement> = makeBlock('label');
export const br: Block<HTMLLabelElement> = makeBlock('br');
