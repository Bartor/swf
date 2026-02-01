type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

type PickWritable<T> = Pick<T, WritableKeys<T>>;

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type PickFunctions<T> = Pick<T, FunctionKeys<T>>;

export type PrepareProps<T> = Partial<Omit<PickWritable<T>, 'style'> & { style: string }>;
