import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";
import * as C from "fp-ts/Console";
import * as R from "fp-ts/Reader";
import * as RE from "fp-ts/ReaderEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as RA from "fp-ts/ReadonlyArray";
import { Parser } from "parser-ts/lib/Parser";
import * as CC from "parser-ts/code-frame";

import { gameOfLife, helloWorld } from "../02-runtime-and-programs/programs";
import { runtime } from "../02-runtime-and-programs/runtime-node";
import { runMainTask } from "../05-task/runtime";
import * as RT from "../06-taskreader/readerTask";

import { program as ProgramParser, Node } from "./parser";
import * as M from "./memory";
import * as IR from "./ir";

const interpretIROp = (irop: IR.Op, memory: M.Memory): RT.ReaderTask<IOEnv, M.Memory> =>
  pipe(
    irop,
    IR.Op.match({
      Add: ({ value }) =>
        RT.of(
          pipe(
            memory,
            M.update((a) => a + value)
          )
        ),
      Move: ({ shift }) =>
        RT.of(
          pipe(
            memory,
            M.move((a) => a + shift)
          )
        ),
      Read: () =>
        pipe(
          ioRead(),
          RT.map((c) => pipe(memory, M.write(c.charCodeAt(0))))
        ),
      Write: (): RT.ReaderTask<IOEnv, M.Memory> =>
        pipe(
          RT.of(memory),
          RT.chainFirst((memory) => ioWrite(String.fromCharCode(M.read(memory))))
        ),
      Loop: ({ body }) =>
        RT.whileRT(
          RT.of(memory),
          (m) => M.read(m) !== 0,
          (m) => interpretIROps(body, m)
        ),
    })
  );

const interpretIROps = (irops: ReadonlyArray<IR.Op>, memory: M.Memory): RT.ReaderTask<IOEnv, M.Memory> =>
  pipe(
    irops,
    RA.reduce(RT.of(memory), (prevInterpretResult, irop) =>
      pipe(
        prevInterpretResult,
        RT.chain((m) => interpretIROp(irop, m))
      )
    )
  );

type Char = string;

type IORead = { ioRead: T.Task<Char> };
type IOWrite = { ioWrite: (c: Char) => T.Task<void> };
type IOEnv = IORead & IOWrite;

const ioWrite =
  (s: string): RT.ReaderTask<IOWrite, void> =>
  ({ ioWrite }) =>
    ioWrite(s);

const ioRead =
  (): RT.ReaderTask<IORead, string> =>
  ({ ioRead }) =>
    ioRead;

const createMemory =
  (): R.Reader<{ memorySize: number; cellSize: number }, M.Memory> =>
  ({ memorySize, cellSize }) =>
    M.create(memorySize, cellSize);

const parseProgram: (p: Parser<string, Node[]>) => RE.ReaderEither<{ code: string }, string, Node[]> =
  (parser) =>
  ({ code }) =>
    CC.run(parser, code);

runMainTask({
  code: helloWorld,
  runtime,
  memorySize: 30_000,
  cellSize: 256,

  main: pipe(
    RTE.Do,
    RTE.bind("parser", () => RTE.of(ProgramParser())),
    RTE.bind("memory", () => RTE.fromReader(createMemory())),
    RTE.bindW("ast", ({ parser }) => RTE.fromReaderEither(parseProgram(parser))),
    RTE.bindW("ir", ({ ast }) => RTE.of(IR.fromAst(ast))),
    RTE.bind("optimizedIR", ({ ir }) => RTE.of(IR.optimize(ir))),
    RTE.chainReaderTaskKW(({ optimizedIR, memory }) => interpretIROps(optimizedIR, memory)),
    RTE.matchEW(RT.fromIOK(C.error), (resultingMemory) => RT.of(undefined))
  ),
});
