import { pipe } from "fp-ts/function";
import * as M from "../04-zipper/memory";
import * as Z from "./zipper";

export * from "../04-zipper/memory";

export const move =
  (f: (currentIndex: number) => number) =>
  (m: M.Memory): M.Memory =>
    pipe(m, M.map(Z.moveW(f)));

export const update =
  (f: (currentValue: number) => number) =>
  (m: M.Memory): M.Memory => {
    const _update = pipe(m.intSize, M.wrapModify(f));
    return pipe(m, M.map(Z.modify(_update)));
  };
