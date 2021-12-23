import { pipe } from "fp-ts/function";
import { getOrElse as getOrElseO } from "fp-ts/Option";
import { Zipper, up, start, down, end } from "fp-ts-contrib/Zipper";

export * from "fp-ts-contrib/Zipper";

// wrapped version of up
// returns last elem when trying to down from first
export const upW: <A>(fa: Zipper<A>) => Zipper<A> = (fa) =>
  pipe(
    up(fa),
    getOrElseO(() => end(fa))
  );

// wrapped version of down
// returns first elem when trying to up from last
export const downW: <A>(fa: Zipper<A>) => Zipper<A> = (fa) =>
  pipe(
    down(fa),
    getOrElseO(() => start(fa))
  );
