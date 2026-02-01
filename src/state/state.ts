import { ComponentNodeBlock, LocallyReferenableNodeBlock } from '../blocks';
import {
  EffectCleanup,
  EffectFn,
  MemoizeFn,
  PersistFn,
  PersistResult,
  PersistUpdatePayload,
} from './types';

export const getPersist = (local: LocallyReferenableNodeBlock<ComponentNodeBlock>): PersistFn => {
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
        node.root?.updateTree(node);
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

export const getEffect = (local: LocallyReferenableNodeBlock<ComponentNodeBlock>): EffectFn => {
  return (callback, dependsOn) => {
    if (!local.node.context.initialized) {
      const cleanUp = (callback() as EffectCleanup) ?? (() => {});

      local.node.context.registerNewEffect([cleanUp, dependsOn]);
      local.node.context.nextEffect();
    } else {
      const [cleanUp, currentDependsOn] = local.node.context.getEffect();

      if (
        currentDependsOn.length !== dependsOn.length ||
        currentDependsOn.some((dep, idx) => dependsOn[idx] !== dep)
      ) {
        local.node.root.scheduleEffect(() => {
          cleanUp();
          const newCleanup = (callback() as EffectCleanup) ?? (() => {});

          local.node.context.updateEffect([newCleanup, dependsOn]);
        });
      }

      local.node.context.nextEffect();
    }
  };
};
