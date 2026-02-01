import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';

export type PersistUpdatePayload<T = any> = T | ((previous: T) => T);
export type PersistUpdateFn<T = any> = (newValue: PersistUpdatePayload<T>) => void;
export type PersistResult<T> = [T, PersistUpdateFn<T>];
export type PersistFn = <T = any>(initialValue?: T) => PersistResult<T>;

export const getPersist = (local: LocallyReferencableNodeBlock<ComponentNodeBlock>): PersistFn => {
  const getUpdate = () => {
    const node = local.node;
    const currentIdx = node.context.getPersistIdx();

    return (payload: PersistUpdatePayload) => {
      let newValue = payload;
      const [currentValue] = node.context.getPersist(currentIdx);

      if (typeof payload === 'function') {
        newValue = payload(currentValue);
      }

      if (newValue !== currentValue) {
        node.context.updatePersist(newValue, currentIdx);
        node.root.updateTree(node);
      }
    };
  };

  return <T = any>(initialValue: T) => {
    if (!local.node.context.initialized) {
      local.node.context.nextPersist();
      const update = getUpdate();
      local.node.context.registerNewPersist([initialValue, update]);
    }

    const result: PersistResult<T> = local.node.context.getPersist();

    if (local.node.context.initialized) {
      local.node.context.nextPersist();
    }

    return result;
  };
};
