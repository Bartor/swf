import { PersistUpdateFn } from './persist';

type Persist = [value: any, updatePersist: PersistUpdateFn];
type Memoize<TValue = any, TDepends = any[]> = [value: TValue, dependsOnValues: TDepends];
type Effect = [cleanup: () => void, dependsOnValues: any[]];

export class ExecutionContext {
  private readonly persists: Persist[];
  private readonly memoized: Memoize[];
  private readonly effects: Effect[];
  private currentPersistIdx: number;
  private currentMemoizeIdx: number;
  private currentEffectIdx: number;
  public initialized = false;

  constructor() {
    this.persists = [];
    this.memoized = [];
    this.effects = [];
    this.currentPersistIdx = -1;
    this.currentMemoizeIdx = -1;
    this.currentEffectIdx = -1;
  }

  public registerNewPersist(value: Persist) {
    this.persists.push(value);
  }

  public registerNewMemoize(memoize: Memoize) {
    this.memoized.push(memoize);
  }

  public registerNewEffect(effect: Effect) {
    this.effects.push(effect);
  }

  public updatePersist(newValue: any, idx: number) {
    this.persists[idx][0] = newValue;
  }

  public updateMemoize(newValue: Memoize) {
    this.memoized[this.currentMemoizeIdx] = newValue;
  }

  public updateEffect(newEffect: Effect) {
    this.effects[this.currentEffectIdx] = newEffect;
  }

  public releaseEffects() {
    this.effects.forEach(([cleanup]) => cleanup());
    this.effects.splice(0);
  }

  public getPersist(idx?: number) {
    return this.persists[idx ?? this.currentPersistIdx];
  }

  public getMemoize() {
    return this.memoized[this.currentMemoizeIdx];
  }

  public getEffect() {
    return this.effects[this.currentEffectIdx];
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

  public nextEffect() {
    this.currentEffectIdx++;
  }

  public initialize() {
    this.initialized = true;
    this.currentPersistIdx = 0;
    this.currentMemoizeIdx = 0;
    this.currentEffectIdx = 0;
  }
}
