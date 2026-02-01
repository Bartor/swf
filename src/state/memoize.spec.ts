import { Mock } from 'vitest';
import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';
import { getMemoize } from './memoize';

describe('getMemoize', () => {
  let dependsOnValue: number;
  let local: LocallyReferencableNodeBlock<ComponentNodeBlock>;
  let factory: Mock;

  beforeEach(() => {
    dependsOnValue = 10;
    local = new LocallyReferencableNodeBlock(new ComponentNodeBlock('test'));
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
