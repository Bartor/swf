import { Mock } from 'vitest';
import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';
import { getPersist } from './persist';
import { fn } from '@vitest/spy';

describe('getPersist', () => {
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

  it('should return a persist function', () => {
    const persist = getPersist(local);
    expect(persist).to.be.instanceOf(Function);

    const [, updateValue] = persist();
    expect(updateValue).to.be.instanceOf(Function);
  });

  it('should allow to set an initial value', () => {
    const initialValue = 10;

    const persist = getPersist(local);
    const [value] = persist(initialValue);

    expect(value).to.be.equal(initialValue);
  });

  it('should allow to update the value', () => {
    const initialValue = 10;

    const persist = getPersist(local);
    const [, updateValue] = persist(initialValue);

    // emulate component finishing render
    local.node.context.initialize();
    const newValue = 20;
    updateValue(newValue);
    const [value] = persist(initialValue);
    expect(value).to.be.equal(newValue);
  });

  it('should allow to update the value based on a previous one', () => {
    const initialValue = 10;

    const persist = getPersist(local);
    const [, updateValue] = persist(initialValue);

    // emulate component finishing render
    local.node.context.initialize();

    updateValue((previous: number) => previous + 10);
    const [value] = persist(initialValue);
    expect(value).to.be.equal(20);
  });

  it('should allow to use multiple independent persists', () => {
    const persist = getPersist(local);

    const initialA = 10;
    const initialB = 20;

    const [a, updateA] = persist(initialA);
    const [b, updateB] = persist(initialB);

    expect(a).to.be.equal(initialA);
    expect(b).to.be.equal(initialB);

    // emulate component finishing render
    local.node.context.initialize();

    updateA((value: number) => value + 1);
    updateB((value: number) => value + 1);

    const [newA] = persist(initialA);
    const [newB] = persist(initialB);

    expect(newA).to.be.equal(11);
    expect(newB).to.be.equal(21);
  });
});
