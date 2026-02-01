import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';

export type MemoizeFactoryFn<T> = (...args: any[]) => T;
export type MemoizeFn = <T = any>(makeMemo: MemoizeFactoryFn<T>, dependsOn: any[]) => T;

export const getMemoize = (local: LocallyReferencableNodeBlock<ComponentNodeBlock>): MemoizeFn => {
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
