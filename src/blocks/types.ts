import { PrepareProps } from '../utils/type-utils';

// Blocks
export type BlockElement = HTMLElement | Text;
export type RenderBlock<T extends BlockElement = HTMLElement> = (parent?: Node) => T;
export type ContainingBlock<T extends BlockElement = HTMLElement> = (
  ...children: RenderBlock[]
) => RenderBlock<T>;
export type Block<T extends BlockElement = HTMLElement> = (
  props: PrepareProps<T>,
) => ContainingBlock<T>;

// Tree
export type Node<T extends BlockElement = HTMLElement> = {
  ref: T | null;
  parent?: Node;
  currentProps: PrepareProps<T>;
  children: Node[];
};
