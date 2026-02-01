import { ExecutionContext } from '../state/types';
import { PickFunctions, PrepareProps } from '../utils/type-utils';

// Blocks
export type Renderable = BlockRenderer | string | number;
export type BlockRendererFn<T = any> = (parent?: GenericParentNode, idx?: number) => T | null;
export type BlockRendererFields<T> = {
  [key in keyof PickFunctions<T>]: PickFunctions<T>[key];
};
export type BlockRenderer<T = any> = BlockRendererFn<T> & BlockRendererFields<T>;
export type Block<T extends HTMLElement = HTMLElement> = (
  props: PrepareProps<T>,
  ...children: Renderable[]
) => BlockRenderer<T>;
export type ComponentBlock<TProps = any> = (props: TProps) => BlockRendererFn<TProps>;
export type TextBlock = (text: string) => BlockRendererFn<Text>;

// Tree
abstract class GenericNodeBlock<T> {
  public parent?: GenericParentNode;
  public idx: number;
  public root: Root;
  public renderer: BlockRendererFn<T>;

  childrenSet: Set<GenericChildNode>;
  children: GenericChildNode[];

  constructor(public readonly name: string) {
    this.childrenSet = new Set();
    this.children = [];
  }

  public get numberOfChildren() {
    return this.childrenSet.size;
  }

  public hasChild(child: GenericChildNode) {
    return this.childrenSet.has(child);
  }

  public removeChild(child: GenericChildNode) {
    this.childrenSet.delete(child);
    this.children.splice(child.idx, 1);
  }

  public addChild(child: GenericChildNode) {
    this.childrenSet.add(child);
    this.children.push(child);
  }

  public childAt(idx: number): GenericChildNode | undefined {
    return this.children[idx];
  }
}

export class Root extends GenericNodeBlock<HTMLElement> {
  constructor(
    name: string,
    public readonly updateTree: (node: ComponentNodeBlock) => void,
    public readonly ref?: HTMLElement,
  ) {
    super(name);
  }
}
export class NodeBlock<T extends HTMLElement = HTMLElement> extends GenericNodeBlock<T> {
  public ref?: T;

  constructor(name: string) {
    super(name);
  }

  public currentProps: PrepareProps<T>;
}
export class ComponentNodeBlock<TProps = any> extends GenericNodeBlock<TProps> {
  public readonly context: ExecutionContext;
  public ref?: HTMLElement;
  public currentProps: TProps;
  public internalStateChanged = false;

  constructor(name: string) {
    super(name);
    this.context = new ExecutionContext();
  }
}
export class TextNodeBlock extends GenericNodeBlock<Text> {
  static TEXT_TAG = '__text__';

  public ref?: Text;
  public text: string;

  constructor() {
    super(TextNodeBlock.TEXT_TAG);
  }
}

export class LocallyReferenableNodeBlock<T extends GenericNodeBlock<any>> {
  constructor(private reference: T) {}

  get node() {
    return this.reference;
  }

  set node(newNode: T) {
    this.reference = newNode;
  }
}

export type GenericParentNode = Root | NodeBlock | ComponentNodeBlock;
export type GenericChildNode = NodeBlock | ComponentNodeBlock | TextNodeBlock;
