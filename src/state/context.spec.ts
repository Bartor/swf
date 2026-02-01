import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext } from './context';

describe('ExecutionContext', () => {
  let context: ExecutionContext;

  beforeEach(() => {
    context = new ExecutionContext();
  });

  describe('Initialization', () => {
    it('should start uninitialized with indices at -1', () => {
      expect(context.initialized).toBe(false);
      expect(context.getPersistIdx()).toBe(-1);
      expect(context.getMemoizeIdx()).toBe(-1);
    });

    it('should reset indices to 0 upon initialization', () => {
      context.initialize();
      expect(context.initialized).toBe(true);
      expect(context.getPersistIdx()).toBe(0);
      expect(context.getMemoizeIdx()).toBe(0);
    });
  });

  describe('Persist Storage', () => {
    it('should register and retrieve new persist values', () => {
      const persistData: [any, any] = [10, () => {}];

      context.registerNewPersist(persistData);

      expect(context.getPersist(0)).toBe(persistData);
    });

    it('should update persist values at a specific index', () => {
      const initial: [any, any] = [10, () => {}];
      context.registerNewPersist(initial);

      const newValue = 20;
      context.updatePersist(newValue, 0);

      const [storedValue] = context.getPersist(0);
      expect(storedValue).toBe(newValue);
    });

    it('should iterate indices correctly with nextPersist', () => {
      context.initialize();
      expect(context.getPersistIdx()).toBe(0);

      context.nextPersist();
      expect(context.getPersistIdx()).toBe(1);
    });
  });

  describe('Memoize Storage', () => {
    it('should register and retrieve memoize values', () => {
      const memoData: [any, any[]] = [10, [1, 2]];

      context.initialize();
      context.registerNewMemoize(memoData);

      expect(context.getMemoize()).toBe(memoData);
    });

    it('should update memoize values at current index', () => {
      context.initialize();

      const initial: [any, any[]] = [10, [1]];
      context.registerNewMemoize(initial);

      const updated: [any, any[]] = [20, [2]];
      context.updateMemoize(updated);

      expect(context.getMemoize()).toBe(updated);
    });

    it('should advance memoize index', () => {
      context.initialize();
      expect(context.getMemoizeIdx()).toBe(0);

      context.nextMemoize();
      expect(context.getMemoizeIdx()).toBe(1);
    });
  });

  describe('Effect Storage', () => {
    it('should register and retrieve effects', () => {
      const effectData: [() => void, any[]] = [() => {}, [1]];

      context.initialize();
      context.registerNewEffect(effectData);

      expect(context.getEffect()).toBe(effectData);
    });

    it('should update effect at current index', () => {
      context.initialize();

      const initial: [() => void, any[]] = [() => {}, [1]];
      context.registerNewEffect(initial);

      const updated: [() => void, any[]] = [() => {}, [2]];
      context.updateEffect(updated);

      expect(context.getEffect()).toBe(updated);
    });

    it('should advance effect index correctly', () => {
      const effect1: [() => void, any[]] = [() => {}, [1]];
      const effect2: [() => void, any[]] = [() => {}, [2]];

      context.registerNewEffect(effect1);
      context.registerNewEffect(effect2);

      context.initialize();

      expect(context.getEffect()).toBe(effect1);

      context.nextEffect();

      expect(context.getEffect()).toBe(effect2);
    });
  });
});
