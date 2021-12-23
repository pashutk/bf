import { pipe } from "fp-ts/function";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as Z from "./zipper";

export type Memory = { zipper: Z.Zipper<number>; intSize: number };

export const map =
  (f: (z: Z.Zipper<number>) => Z.Zipper<number>) =>
  (m: Memory): Memory => {
    const zipper = f(m.zipper);
    return zipper === m.zipper
      ? m
      : {
          zipper,
          intSize: m.intSize,
        };
  };

export const create = (memSize: number, intSize: number): Memory => ({
  intSize,
  zipper: pipe(memSize, RNEA.replicate(0), Z.fromReadonlyNonEmptyArray, Z.start),
});

export const left = (m: Memory): Memory => pipe(m, map(Z.upW));

export const right = (m: Memory): Memory => pipe(m, map(Z.downW));

export const wrapModify = (f: (a: number) => number) => (lim: number) => (a: number) => f(a) % lim;

export const inc = (m: Memory): Memory => {
  const _inc = pipe(
    m.intSize,
    wrapModify((a) => a + 1)
  );
  return pipe(m, map(Z.modify(_inc)));
};

export const dec = (m: Memory): Memory => {
  const _dec = pipe(
    m.intSize,
    wrapModify((a) => a - 1)
  );
  return pipe(m, map(Z.modify(_dec)));
};

export const read = (m: Memory): number => m.zipper.focus;

export const write =
  (a: number) =>
  (m: Memory): Memory =>
    pipe(m, map(Z.update(a)));
