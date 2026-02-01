import { Mock } from 'vitest';
import { ComponentNodeBlock, LocallyReferenableNodeBlock } from '../blocks';
import { getMemoize, getPersist } from './state';

describe('getPersist', () => {
  let local: LocallyReferenableNodeBlock<ComponentNodeBlock>;

  beforeEach(() => {
    local = new LocallyReferenableNodeBlock(new ComponentNodeBlock('test'));
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

describe('getMemoize', () => {
  let dependsOnValue: number;
  let local: LocallyReferenableNodeBlock<ComponentNodeBlock>;
  let factory: Mock;

  beforeEach(() => {
    dependsOnValue = 10;
    local = new LocallyReferenableNodeBlock(new ComponentNodeBlock('test'));
    factory = vi.fn(() => dependsOnValue);
  });

  it('should return a value', () => {
    const memoize = getMemoize(local);
    const value = memoize(factory, [dependsOnValue]);

    // emulate component finishing render
    local.node.context.initialize();

    expect(value).to.be.equal(value);
    expect(factory).to.have.toHaveBeenCalledOnce();
  });

  it('should not call a factory function when dependsOn did not change', () => {
    const memoize = getMemoize(local);
    const initialValue = memoize(factory, [dependsOnValue]);

    expect(initialValue).to.be.equal(dependsOnValue);

    // emulate component finishing render
    local.node.context.initialize();

    const currentValue = memoize(factory, [dependsOnValue]);

    expect(currentValue).to.be.equal(dependsOnValue);
    expect(factory).to.have.toHaveBeenCalledTimes(1);
  });

  it('should call a factory function when dependsOn did change and return a new value', () => {
    const memoize = getMemoize(local);
    const initialValue = memoize(factory, [dependsOnValue]);

    expect(initialValue).to.be.equal(dependsOnValue);

    // emulate component finishing render
    local.node.context.initialize();

    dependsOnValue = 11;
    const currentValue = memoize(factory, [dependsOnValue]);

    expect(currentValue).to.be.equal(dependsOnValue);
    expect(factory).to.have.toHaveBeenCalledTimes(2);
  });
});

describe('integration', () => {
  let local: LocallyReferenableNodeBlock<ComponentNodeBlock>;

  beforeEach(() => {
    local = new LocallyReferenableNodeBlock(new ComponentNodeBlock('test'));
  });

  it('should update values in memoize based on changes in persis', () => {
    const persist = getPersist(local);
    const memoize = getMemoize(local);

    const [value, updateValue] = persist(10);
    const memoizedValue = memoize(() => value * 10, [value]);

    expect(value).to.be.equal(10);
    expect(memoizedValue).to.be.equal(100);

    // emulate component finishing render
    local.node.context.initialize();

    updateValue(20);
    const [currentValue] = persist(10);
    const currentMemoizedValue = memoize(() => currentValue * 10, [currentValue]);

    expect(currentValue).to.be.equal(20);
    expect(currentMemoizedValue).to.be.equal(200);
  });
});
