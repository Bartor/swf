import { ComponentNodeBlock, LocallyReferenableNodeBlock } from '../blocks';
import { MemoizeFn, PersistFn, PersistResult, PersistUpdatePayload } from './types';

export const getPersist = (local: LocallyReferenableNodeBlock<ComponentNodeBlock>): PersistFn => {
  const getUpdate = () => {
    const node = local.node;
    const currentValue = node.context.getPersist();
    const currentIdx = node.context.getPersistIdx();

    return (payload: PersistUpdatePayload) => {
      let newValue = payload;

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
      local.node.context.registerNewPersist(initialValue);
      local.node.context.nextPersist();
    }

    const result: PersistResult<T> = [local.node.context.getPersist(), getUpdate()];
    local.node.context.nextPersist();

    return result;
  };
};

export const getMemoize = (local: LocallyReferenableNodeBlock<ComponentNodeBlock>): MemoizeFn => {
  return (factory, dependsOn) => {
    let result;
    if (!local.node.context.initialized) {
      const value = factory();
      local.node.context.registerNewMemoize([value, dependsOn]);
      local.node.context.nextMemoize();
      result = value;
    } else {
      const [currentValue, currentDependsOn] = local.node.context.getMemoize();
      result = currentValue;

      if (
        dependsOn.length !== currentDependsOn.length ||
        dependsOn.some((dep, depIdx) => dep !== currentDependsOn[depIdx])
      ) {
        const value = factory();
        result = value;
        local.node.context.updateMemoize([value, dependsOn]);
      }

      local.node.context.nextMemoize();
    }

    return result;
  };
};
