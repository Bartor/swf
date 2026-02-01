import { ComponentNodeBlock } from '../blocks';

export type PersistUpdatePayload<T = any> = T | ((previous: T) => T);
export type PersistUpdateFn<T = any> = (newValue: PersistUpdatePayload<T>) => void;
export type PersistResult<T> = [T, PersistUpdateFn<T>];
export type PersistFn<T = any> = (initialValue?: T) => PersistResult<T>;
export type PersistFnGetter<T = any> = (node: ComponentNodeBlock) => PersistFn<T>;

export type MemoizeFactoryFn<T> = (...args: any[]) => T;
export type MemoizeFn<T = any> = (makeMemo: MemoizeFactoryFn<T>, dependsOn: any[]) => T;
export type MemoizeFnGetter<T = any> = (node: ComponentNodeBlock) => MemoizeFn<T>;

type Memoized<TValue = any, TDepends = any[]> = [value: TValue, dependsOnValues: TDepends];
export class ExecutionContext {
  private readonly persists: any[];
  private readonly memoized: Memoized[];
  private currentPersistIdx: number;
  private currentMemoizeIdx: number;
  public initialized = false;

  constructor() {
    this.persists = [];
    this.memoized = [];
    this.currentPersistIdx = -1;
    this.currentMemoizeIdx = -1;
  }

  public registerNewPersist(value: any) {
    this.persists.push(value);
  }

  public registerNewMemoize(memoize: Memoized) {
    this.memoized.push(memoize);
  }

  public updatePersist(newValue: any, idx: number) {
    this.persists[idx] = newValue;
  }

  public updateMemoize(newValue: any) {
    this.memoized[this.currentMemoizeIdx] = newValue;
  }

  public getPersist() {
    return this.persists[this.currentPersistIdx];
  }

  public getMemoize() {
    return this.memoized[this.currentMemoizeIdx];
  }

  public getPersistIdx() {
    return this.currentPersistIdx;
  }

  public getMemoizeIdx() {
    return this.currentMemoizeIdx;
  }

  public nextPersist() {
    this.currentPersistIdx++;
  }

  public nextMemoize() {
    this.currentMemoizeIdx++;
  }

  public initialize() {
    this.initialized = true;
    this.currentPersistIdx = 0;
    this.currentMemoizeIdx = 0;
  }
}
