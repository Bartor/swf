import { BlockRendererFn } from '../blocks';

export type Route = {
  path: string;
  children?: Route[];
  renderer: BlockRendererFn;
};

export type RouterOptions = {
  root?: string;
};

export const router = (routes: Route[], { root = '/' }: RouterOptions) => {
  const handleRoute = () => {
    const { pathname } = location;
  };

  return () => {};
};
