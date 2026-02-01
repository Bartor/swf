import { describe, it, expect, beforeEach, type Mock } from 'vitest';
import { ComponentNodeBlock, LocallyReferencableNodeBlock } from '../blocks';
import { getEffect } from './effect';
import { fn } from '@vitest/spy';

describe('getEffect', () => {
  let local: LocallyReferencableNodeBlock<ComponentNodeBlock>;
  let scheduleEffect: Mock;

  beforeEach(() => {
    local = new LocallyReferencableNodeBlock(new ComponentNodeBlock('test'));
    scheduleEffect = fn();
    local.node.root = { scheduleEffect } as any;
  });

  it('should run the effect immediately on first render', () => {
    const effect = getEffect(local);
    const callback = fn();

    effect(callback, [1]);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(scheduleEffect).not.toHaveBeenCalled();
  });

  it('should not re-run effect if dependencies stay the same', () => {
    const effect = getEffect(local);
    const callback = fn();

    effect(callback, [1]);
    local.node.context.initialize();
    callback.mockClear();

    effect(callback, [1]);

    expect(scheduleEffect).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('should schedule an effect update if dependencies change', () => {
    const effect = getEffect(local);
    const callback = fn();

    effect(callback, [1]);
    local.node.context.initialize();
    callback.mockClear();

    effect(callback, [2]);

    expect(scheduleEffect).toHaveBeenCalledTimes(1);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should execute cleanup and new effect when the scheduled function runs', () => {
    const effect = getEffect(local);
    const cleanup = fn();
    const callback = fn().mockReturnValue(cleanup);

    effect(callback, [1]);
    local.node.context.initialize();

    effect(callback, [2]);

    expect(scheduleEffect).toHaveBeenCalledTimes(1);

    const scheduledJob = scheduleEffect.mock.calls[0][0];
    scheduledJob();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple effects correctly', () => {
    const effect = getEffect(local);
    const cb1 = fn();
    const cb2 = fn();

    effect(cb1, ['a']);
    effect(cb2, ['b']);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);

    local.node.context.initialize();
    cb1.mockClear();
    cb2.mockClear();

    effect(cb1, ['a-changed']);
    effect(cb2, ['b']);

    expect(scheduleEffect).toHaveBeenCalledTimes(1);

    const scheduledFn = scheduleEffect.mock.calls[0][0];
    scheduledFn();

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).not.toHaveBeenCalled();
  });
});
