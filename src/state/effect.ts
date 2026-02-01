import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';

export type EffectCleanup = () => void;
export type EffectCallback = () => void | EffectCleanup;
export type EffectFn = (callback: EffectCallback, dependsOn: any[]) => void;
export type ScheduledEffectCall = () => void;

export const getEffect = (local: LocallyReferencableNodeBlock<ComponentNodeBlock>): EffectFn => {
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
