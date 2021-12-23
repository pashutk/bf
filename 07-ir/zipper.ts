import { Zipper, length, toReadonlyNonEmptyArray, make } from "fp-ts-contrib/Zipper";

export * from "fp-ts-contrib/Zipper";

export const moveW: <A>(f: (currentIndex: number) => number) => (fa: Zipper<A>) => Zipper<A> = (f) => (z) => {
  const newIndex = f(z.lefts.length) % length(z);
  const rnea = toReadonlyNonEmptyArray(z);
  return make(rnea.slice(0, newIndex), rnea[newIndex], rnea.slice(newIndex + 1));
};
