import { Char, char, notOneOf } from "parser-ts/char";
import { Parser, map, many, alt, chain, chainFirst, between, eof } from "parser-ts/Parser";
import { constant, pipe } from "fp-ts/lib/function";

// Simple operation constructor
// Simple means it is not parameterized
const SimpleOp = <A extends string>(a: A) => ({
  _: a,
});

// Simple operation type constructor
// Simple means it is not parameterized
type SimpleOp<A> = {
  _: A;
};

// Constructors for the bf operations
// (except jump operations)
const Mvr = constant(SimpleOp("mvr"));
const Mvl = constant(SimpleOp("mvl"));
const Inc = constant(SimpleOp("inc"));
const Dec = constant(SimpleOp("dec"));
const Iow = constant(SimpleOp("iow"));
const Ior = constant(SimpleOp("ior"));

// BF operations type (except jump operations)
// Also includes Comment type (excluded from resulting ast)
type SimpleOps =
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
  body: (SimpleOps | Jmp)[];
};

export type Node = SimpleOps | Jmp;

// Jmp op contructor
const Jmp = (body: Node[]): Jmp => ({
  _: "jmp",
  body,
});

// Comment parser
// Comment is any char but command
const CommentP = () => notOneOf("><+-.,[]");

// Comments parser
// Comments is zero or more of Comment
export const CommentsP = () => many(CommentP());

// SimpleOp parser constructor
// Takes char and SimpleOp instance
// Returns parser which consumes such char and parses it as SimpleOp instance
//
// parse('a', Mvr())('a') -> ParseSucc(Mvr())
// parse('b', Mvr())('a') -> ParseErr('a')
const _charAsSimpleOpParser = (c: Char, op: SimpleOps) =>
  pipe(
    char(c),
    map(() => op)
  );

// SimpleOps parser which tries to parse char as any of SimpleOps
const SimpleOpsP = (): Parser<string, SimpleOps> =>
  pipe(
    _charAsSimpleOpParser(">", Mvr()),
    alt(() => _charAsSimpleOpParser("<", Mvl())),
    alt(() => _charAsSimpleOpParser("+", Inc())),
    alt(() => _charAsSimpleOpParser("-", Dec())),
    alt(() => _charAsSimpleOpParser(".", Iow())),
    alt(() => _charAsSimpleOpParser(",", Ior()))
  );

// Combinator which takes any parser and tries to parse input using it ignoring comments
const ignoreComments = <A>(p: Parser<string, A>): Parser<string, A> =>
  pipe(
    CommentsP(),
    chain(() => p),
    chainFirst(CommentsP)
  );

// SimpleOps parser contructor
// Ignores comments
export const SimpleOps = (): Parser<string, SimpleOps> => ignoreComments(SimpleOpsP());

// Jmp parser contructor
// Parses SimpleOps or Jmp inside []
// Note that this parser is recursive
export const JmpP = (): Parser<string, Jmp> =>
  pipe(ignoreComments(many(pipe(SimpleOps(), alt<string, Node>(JmpP)))), between(char("["), char("]")), map(Jmp));

// Node parser constructor
// Tries to parse Jmp or SimpleOps
const NodeP = (): Parser<string, Node> => pipe(ignoreComments(JmpP()), alt<string, Node>(SimpleOps));

// Program parser is trying to parse any number of Node with EOF at the end
export const ProgramP = (): Parser<string, Node[]> =>
  pipe(
    many(NodeP()),
    chainFirst(() => eof())
  );
