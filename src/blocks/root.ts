import { BlockRenderer, ComponentNodeBlock, Root } from './types';

export const root = (container: HTMLElement, ...children: BlockRenderer[]) => {
  const updateTree = (node: ComponentNodeBlock) => {
    if (node) {
      node.internalStateChanged = true;
    }
    render();
  };

  const rootNode = new Root('root', updateTree, container);

  rootNode.root = rootNode;

  const render = () => {
    children.forEach((child, idx) => {
      const renderedChild = child(rootNode, idx);
      if (renderedChild !== null) {
        container.appendChild(renderedChild);
      }
    });
  };

  render();
};
