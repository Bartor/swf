import { BlockRendererFn, Renderable } from '../blocks';
import { EffectFn } from '../state/effect';
import { MemoizeFn } from '../state/memoize';
import { PersistFn } from '../state/persist';
import { ReduceFn } from '../state/reduce';

export type ComponentFn<TProps extends any[] = any[]> = (...props: TProps) => Renderable[];
export type InjectedProps = {
  persist: PersistFn;
  memoize: MemoizeFn;
  effect: EffectFn;
  reduce: ReduceFn;
};
export type ComponentInjectedPropsFn<TProps extends any[] = any[]> = (
  injectedProps: InjectedProps,
) => ComponentFn<TProps>;
export type ComponentFactory = <TProps extends any[]>(
  injectedPropsFn: ComponentInjectedPropsFn<TProps>,
  customName?: string,
) => (...props: TProps) => BlockRendererFn<TProps>;
