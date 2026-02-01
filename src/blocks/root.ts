import { ScheduledEffectCall } from '../state/types';
import { BlockRenderer, ComponentNodeBlock, NodeRoot } from './types';

export const root = (container: HTMLElement, ...children: BlockRenderer[]) => {
  let scheduledEffects: ScheduledEffectCall[] = [];

  const updateTree = (node: ComponentNodeBlock) => {
    node.internalStateChanged = true;

    render();
  };

  const scheduleEffect = (call: ScheduledEffectCall) => {
    scheduledEffects.push(call);
  };

  const rootNode = new NodeRoot(updateTree, scheduleEffect, container);
  rootNode.root = rootNode;

  const render = () => {
    children.forEach((child, idx) => {
      const renderedChild = child(rootNode, idx);
      if (renderedChild !== null) {
        container.appendChild(renderedChild);
      }
    });

    scheduledEffects.forEach((call) => call());
    scheduledEffects = [];
  };

  render();
};
