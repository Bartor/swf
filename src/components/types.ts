import { BlockRenderer, ComponentBlock } from '../blocks';
import { MemoizeFn, PersistFn } from '../state/types';

export type ComponentFn<TProps extends any[] = any[]> = (...props: TProps) => BlockRenderer[];
export type InjectedProps = {
  persist: PersistFn;
  memoize: MemoizeFn;
};
export type ComponentInjectedPropsFn<TProps extends any[] = any[]> = (
  injectedProps: InjectedProps,
) => ComponentFn<TProps>;
export type ComponentFactory = (
  injectedPropsFn: ComponentInjectedPropsFn,
  customName?: string,
) => ComponentBlock;
