import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';

export type ReduceResult<TState, TAction> = [state: TState, dispatch: (action: TAction) => void];
export type ReduceCall<TAction, TState> = (action: TAction, state: TState) => TState;
export type ReduceFn = <TState, TAction>(
  initialState: TState,
  call: ReduceCall<TAction, TState>,
) => ReduceResult<TState, TAction>;

export const getReduce = (local: LocallyReferencableNodeBlock<ComponentNodeBlock>): ReduceFn => {
  const getDispatch = <TState, TAction>(reducer: ReduceCall<TAction, TState>) => {
    const node = local.node;
    const currentIdx = node.context.getPersistIdx();

    return (action: TAction) => {
      const [currentState] = node.context.getPersist(currentIdx) as [TState, any];

      const newState = reducer(action, currentState);

      if (newState !== currentState) {
        node.context.updatePersist(newState, currentIdx);
        node.root.updateTree(node);
      }
    };
  };

  return <TState, TAction>(
    initialState: TState,
    reducer: ReduceCall<TAction, TState>,
  ): ReduceResult<TState, TAction> => {
    if (!local.node.context.initialized) {
      local.node.context.nextPersist();

      const dispatch = getDispatch(reducer);

      local.node.context.registerNewPersist([
        initialState instanceof Object ? { ...initialState } : initialState,
        dispatch,
      ]);
    }

    const result = local.node.context.getPersist() as ReduceResult<TState, TAction>;

    if (local.node.context.initialized) {
      local.node.context.nextPersist();
    }

    return result;
  };
};
