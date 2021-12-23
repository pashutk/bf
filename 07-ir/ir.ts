import { absurd, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import { ADTType, makeADT, ofType } from "morphic-ts/lib/adt";
import { Node, isNodeNoCmt } from "./parser";

type Add = {
  _: "Add";
  value: number;
};

type Move = {
  _: "Move";
  shift: number;
};

type Read = {
  _: "Read";
};

type Write = {
  _: "Write";
};

type Loop = {
  _: "Loop";
  body: ReadonlyArray<Add | Move | Read | Write | Loop>;
};

export const Op = makeADT("_")({
  Add: ofType<Add>(),
  Move: ofType<Move>(),
  Read: ofType<Read>(),
  Write: ofType<Write>(),
  Loop: ofType<Loop>(),
});

export type Op = ADTType<typeof Op>;

type SameOpAcc = {
  result: ReadonlyArray<Op>;
  last: Op;
};

const zeroSameOpAcc = (last: Op): SameOpAcc => ({
  result: [],
  last,
});

const sameOpAccToRNEA = (soa: SameOpAcc): RNEA.ReadonlyNonEmptyArray<Op> => pipe(soa.result, RA.append(soa.last));

const collapseAddAndMove = ({ last, result }: SameOpAcc, op: Op): SameOpAcc => {
  if (Op.is.Add(last) && Op.is.Add(op)) {
    return {
      result,
      last: Op.of.Add({ value: last.value + op.value }),
    };
  }

  if (Op.is.Move(last) && Op.is.Move(op)) {
    return {
      result,
      last: Op.of.Move({ shift: last.shift + op.shift }),
    };
  }

  return {
    result: pipe(result, RA.append(last)),
    last: op,
  };
};

const _optimize = (ops: RNEA.ReadonlyNonEmptyArray<Op>): ReadonlyArray<Op> =>
  pipe(
    ops,
    RNEA.matchLeft((head, tail) => pipe(tail, RA.reduce(zeroSameOpAcc(head), collapseAddAndMove), sameOpAccToRNEA))
  );

export const fromAst = (ast: Node[]): ReadonlyArray<Op> =>
  pipe(
    ast,
    RA.filter(isNodeNoCmt),
    RA.map((n) => {
      switch (n._) {
        case "mvr":
          return Op.of.Move({ shift: 1 });
        case "mvl":
          return Op.of.Move({ shift: -1 });
        case "inc":
          return Op.of.Add({ value: 1 });
        case "dec":
          return Op.of.Add({ value: -1 });
        case "iow":
          return Op.of.Write({});
        case "ior":
          return Op.of.Read({});
        case "jmp":
          return Op.of.Loop({ body: fromAst(n.body) });
        default:
          return absurd(n);
      }
    })
  );

export const optimize = (ops: ReadonlyArray<Op>): ReadonlyArray<Op> =>
  pipe(
    RNEA.fromReadonlyArray(ops),
    O.map(_optimize),
    O.getOrElse(() => RA.zero())
  );
