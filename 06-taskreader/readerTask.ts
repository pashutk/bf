import { pipe } from "fp-ts/function";
import { ReaderTask, chain, of } from "fp-ts/ReaderTask";

export * from "fp-ts/ReaderTask";

export const whileRT = <R, A>(
  zero: ReaderTask<R, A>,
  cont: (a: A) => boolean,
  task: (a: A) => ReaderTask<R, A>
): ReaderTask<R, A> => {
  const go = (t: ReaderTask<R, A>): ReaderTask<R, A> =>
    pipe(
      t,
      chain((a) => (cont(a) ? go(task(a)) : of(a)))
    );

  return go(zero);
};
