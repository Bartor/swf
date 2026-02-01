import { Mock } from 'vitest';
import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';
import { getReduce } from './reduce';
import { fn } from '@vitest/spy';

describe('getReduce', () => {
  let local: LocallyReferencableNodeBlock<ComponentNodeBlock>;
  let updateTree: Mock;

  beforeEach(() => {
    updateTree = fn();
    local = new LocallyReferencableNodeBlock(new ComponentNodeBlock('test'));
    local.node.root = { updateTree } as any;
  });

  afterEach(() => {
    updateTree.mockClear();
  });

  it('should return a reduce function', () => {
    const reduce = getReduce(local);
    expect(reduce).to.be.instanceOf(Function);

    const [state, dispatch] = reduce(0, (action, state) => state);
    expect(state).to.equal(0);
    expect(dispatch).to.be.instanceOf(Function);
  });

  it('should allow to set an initial state', () => {
    const initialState = { count: 10 };
    const reduce = getReduce(local);

    const [state] = reduce(initialState, (action, s) => s);

    expect(state).to.deep.equal(initialState);
  });

  it('should allow to update state via dispatch', () => {
    const initialState = 10;
    const reduce = getReduce(local);

    const reducer = (action: number) => action;

    const [, dispatch] = reduce(initialState, reducer);

    local.node.context.initialize();

    const newValue = 20;
    dispatch(newValue);

    const [state] = reduce(initialState, reducer);
    expect(state).to.equal(newValue);
  });

  it('should calculate new state based on action and previous state', () => {
    const initialState = 10;
    const reduce = getReduce(local);

    type Action = { type: 'INC' } | { type: 'DEC' };

    const reducer = (action: Action, state: number) => {
      switch (action.type) {
        case 'INC':
          return state + 1;
        case 'DEC':
          return state - 1;
        default:
          return state;
      }
    };

    const [, dispatch] = reduce(initialState, reducer);

    // emulate component finishing render
    local.node.context.initialize();

    dispatch({ type: 'INC' });

    const [stateAfterInc] = reduce(initialState, reducer);
    expect(stateAfterInc).to.equal(11);

    // emulate component finishing render
    local.node.context.initialize();

    const [, dispatch2] = reduce(initialState, reducer);
    dispatch2({ type: 'DEC' }); // 11 - 1 = 10

    // emulate component finishing render
    local.node.context.initialize();

    const [stateAfterDec] = reduce(initialState, reducer);
    expect(stateAfterDec).to.equal(10);
  });

  it('should allow to use multiple independent reducers', () => {
    const reduce = getReduce(local);

    const initialA = 0;
    const initialB = 100;

    const reducerA = (action: string, state: number) => state + 1;
    const reducerB = (action: string, state: number) => state - 1;

    const [a, dispatchA] = reduce(initialA, reducerA);
    const [b, dispatchB] = reduce(initialB, reducerB);

    expect(a).to.equal(initialA);
    expect(b).to.equal(initialB);

    // emulate component finishing render
    local.node.context.initialize();

    dispatchA('INCREMENT');
    dispatchB('DECREMENT');

    const [newA] = reduce(initialA, reducerA);
    const [newB] = reduce(initialB, reducerB);

    expect(newA).to.equal(1);
    expect(newB).to.equal(99);
  });
});
