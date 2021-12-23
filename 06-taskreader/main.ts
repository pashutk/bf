import { absurd, pipe } from "fp-ts/function";
import * as RA from "fp-ts/ReadonlyArray";
import * as C from "fp-ts/Console";
import * as R from "fp-ts/Reader";
import * as RE from "fp-ts/ReaderEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as T from "fp-ts/Task";

import { Parser } from "parser-ts/lib/Parser";
import * as CC from "parser-ts/code-frame";

import { runtime } from "../02-runtime-and-programs/runtime-node";
import { gameOfLife, helloWorld } from "../02-runtime-and-programs/programs";
import { ProgramP as ProgramParser, Node } from "../03-parser/parser";
import * as M from "../04-zipper/memory";
import { runMainTask } from "../05-task/runtime";

import * as RT from "./readerTask";

type Char = string;

type IORead = { ioRead: T.Task<Char> };
type IOWrite = { ioWrite: (c: Char) => T.Task<void> };
type IOEnv = IORead & IOWrite;

const ioWrite =
  (s: string): RT.ReaderTask<IOWrite, void> =>
  (ctx) =>
    ctx.ioWrite(s);

const ioRead = (): RT.ReaderTask<IORead, string> => (ctx) => ctx.ioRead;

const createMemory = (): R.Reader<{ memorySize: number; cellSize: number }, M.Memory> => (ctx) =>
  M.create(ctx.memorySize, ctx.cellSize);

const parseProgram: (p: Parser<string, Node[]>) => RE.ReaderEither<{ code: string }, string, Node[]> =
  (parser) => (ctx) =>
    CC.run(parser, ctx.code);

const interpretNode = (node: Node, memory: M.Memory): RT.ReaderTask<IOEnv, M.Memory> => {
  switch (node._) {
    case "mvr":
      return RT.of(M.right(memory));

    case "mvl":
      return RT.of(M.left(memory));

    case "cmt":
      return RT.of(memory);

    case "inc":
      return RT.of(M.inc(memory));

    case "dec":
      return RT.of(M.dec(memory));

    case "iow":
      return pipe(
        RT.of(memory),
        RT.chainFirst((m) => ioWrite(String.fromCharCode(M.read(m))))
      );

    case "ior":
      return pipe(
        ioRead(),
        RT.map((c) => pipe(memory, M.write(c.charCodeAt(0))))
      );

    case "jmp":
      return RT.whileRT(
        RT.of(memory),
        (m) => M.read(m) !== 0,
        (m) => interpretNodes(node.body, m)
      );

    default:
      return absurd(node);
  }
};

const interpretNodes = (nodes: Node[], memory: M.Memory): RT.ReaderTask<IOEnv, M.Memory> =>
  pipe(
    nodes,
    RA.reduce(RT.of(memory), (prevInterpretResult, node) =>
      pipe(
        prevInterpretResult,
        RT.chain((z) => interpretNode(node, z))
      )
    )
  );

runMainTask({
  code: gameOfLife,
  runtime,
  memorySize: 30_000,
  cellSize: 256,

  main: pipe(
    RTE.Do,
    RTE.bind("parser", () => RTE.of(ProgramParser())),
    RTE.bind("memory", () => RTE.fromReader(createMemory())),
    RTE.bindW("ast", ({ parser }) => RTE.fromReaderEither(parseProgram(parser))),
    RTE.chainReaderTaskKW(({ ast, memory }) => interpretNodes(ast, memory)),
    RTE.matchEW(RT.fromIOK(C.error), (resultingMemory) => RT.of(undefined))
  ),
});
