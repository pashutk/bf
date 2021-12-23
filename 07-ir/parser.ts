import { Char, char, notOneOf } from "parser-ts/char";
import {
  Parser,
  map,
  many,
  alt,
  chain,
  chainFirst,
  between,
  eof,
} from "parser-ts/Parser";
import { constant, pipe } from "fp-ts/lib/function";

// Generic operation constructor
const simpleOp = <A extends string>(a: A) => ({
  _: a,
});

// Generic operation type constructor
type SimpleOp<A> = {
  _: A;
};

// Constructors for the bf operations (except jump operations)
const mvr = constant(simpleOp("mvr"));
const mvl = constant(simpleOp("mvl"));
const inc = constant(simpleOp("inc"));
const dec = constant(simpleOp("dec"));
const iow = constant(simpleOp("iow"));
const ior = constant(simpleOp("ior"));

// BF operations type (except jump operations)
// Also includes Comment type (excluded from result ast)
type SimpleIns =
  | SimpleOp<"mvr">
  | SimpleOp<"mvl">
  | SimpleOp<"inc">
  | SimpleOp<"dec">
  | SimpleOp<"iow">
  | SimpleOp<"ior">
  | SimpleOp<"cmt">;

// BF jump operation
// Since jmp operations in BF is paired (existence of'[' means existence of matching ']')
// Jmp operation represented in AST as as Jmp node with some body
// Body of Jmp is a BF program
// Basically its kinda conditional loop declaration
type Jmp = {
  _: "jmp";
  body: (SimpleIns | Jmp)[];
};

export type Node = SimpleIns | Jmp;

type NodeNoCmt = Exclude<Node, SimpleOp<"cmt">>;

const isCmtOp = (a: Node): a is SimpleOp<"cmt"> => a._ === "cmt";

export const isNodeNoCmt = (a: Node): a is NodeNoCmt => !isCmtOp(a);

const jmpC = (body: Node[]): Jmp => ({
  _: "jmp",
  body,
});

const comment = () => notOneOf("><+-.,[]");
export const comments = () => many(comment());

const simpleOpC = (c: Char, f: () => SimpleIns) => () => pipe(char(c), map(f));

const simpleOpParser = () =>
  pipe(
    simpleOpC(">", mvr)(),
    alt(simpleOpC("<", mvl)),
    alt(simpleOpC("+", inc)),
    alt(simpleOpC("-", dec)),
    alt(simpleOpC(".", iow)),
    alt(simpleOpC(",", ior))
  );

const ignoreComments = <A>(p: Parser<string, A>) =>
  pipe(
    comments(),
    chain(() => p),
    chainFirst(comments)
  );

export const ops = () => ignoreComments(simpleOpParser());

export const jmp = (): Parser<string, Jmp> =>
  pipe(
    ignoreComments(many(pipe(ops(), alt<string, Node>(jmp)))),
    between(char("["), char("]")),
    map(jmpC)
  );

const jmps = () => ignoreComments(jmp());

const node = (): Parser<string, Node> => pipe(jmps(), alt<string, Node>(ops));

export const program = (): Parser<string, Node[]> =>
  pipe(
    many(node()),
    chainFirst(() => eof())
  );
