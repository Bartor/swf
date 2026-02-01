import {
  BlockRendererFn,
  ComponentNodeBlock,
  GenericParentNode,
  LocallyReferenableNodeBlock,
} from '../blocks';
import { getMemoize, getPersist } from '../state/state';
import { makeRenderable } from '../utils/rendering-utils';
import { ComponentFactory, ComponentInjectedPropsFn } from './types';

export const component: ComponentFactory = (() => {
  let componentId = 0;

  return <TProps extends any[] = any[]>(
    injectedPropsFn: ComponentInjectedPropsFn<TProps>,
    customName?: string,
  ) => {
    // create local reference for injected fns, establish name
    const name = customName ?? `__c${componentId++}`;

    const local = new LocallyReferenableNodeBlock<ComponentNodeBlock<TProps>>(
      new ComponentNodeBlock(name),
    );

    const persist = getPersist(local);
    const memoize = getMemoize(local);
    const componentFn = injectedPropsFn({ persist, memoize });

    return function block(...props: TProps) {
      function renderer(parent?: GenericParentNode, idx: number = -1): null {
        let hasToRender = false;

        // check if a Node exists...
        const existingNode = parent?.childAt(idx);
        if (existingNode?.name === name) {
          // ...if yes -> switch to it
          local.node = existingNode as ComponentNodeBlock<TProps>;
        } else {
          // ...if no -> recreate local reference as unique block usage
          local.node = new ComponentNodeBlock(name);
          local.node.parent = parent;
          local.node.root = parent?.root;
          local.node.ref = parent?.ref;
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
          local.node.currentProps = props;
        }

        const hasInternalStateChanged =
          local.node.internalStateChanged || !local.node.context.initialized;

        if (havePropsChanged || hasInternalStateChanged || hasToRender) {
          const children = componentFn(...local.node.currentProps);
          local.node.context.initialize();
          const preprocessedChildren = makeRenderable(children);
          const renderedChildren = preprocessedChildren.map((child, idx) => child(local.node, idx));

          renderedChildren.forEach((child) => {
            if (child !== null) {
              local.node.ref.appendChild(child);
            }
          });
        }

        return null;
      }

      return renderer as BlockRendererFn<TProps>;
    };
  };
})();
