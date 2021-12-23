import { pipe } from "fp-ts/function";
import { Task, chain, of } from "fp-ts/Task";

export * from "fp-ts/Task";

export const whileT = <A>(zero: Task<A>, cont: (a: A) => boolean, task: (a: A) => Task<A>): Task<A> => {
  const go = (t: Task<A>): Task<A> =>
    pipe(
      t,
      chain((a) => (cont(a) ? go(task(a)) : of(a)))
    );

  return go(zero);
};
