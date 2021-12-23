import { absurd, constVoid, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import * as C from "fp-ts/Console";

import * as CC from "parser-ts/code-frame";

import { helloWorld } from "../02-runtime-and-programs/programs";
import { runtime } from "../02-runtime-and-programs/runtime-node";
import { ProgramP as ProgramParser, Node } from "../03-parser/parser";
import * as M from "../04-zipper/memory";

import * as T from "./task";
import { runMainTask } from "./runtime";

runMainTask({
  code: helloWorld,
  runtime,
  memorySize: 30_000,
  cellSize: 256,

  main: (ctx) => {
    const interpretNode = (node: Node, memory: M.Memory): T.Task<M.Memory> => {
      switch (node._) {
        case "mvr":
          return T.of(M.right(memory));

        case "mvl":
          return T.of(M.left(memory));

        case "cmt":
          return T.of(memory);

        case "inc":
          return T.of(M.inc(memory));

        case "dec":
          return T.of(M.dec(memory));

        case "iow":
          return pipe(
            ctx.ioWrite(String.fromCharCode(M.read(memory))),
            T.map(() => memory)
          );

        case "ior":
          return pipe(
            ctx.ioRead,
            T.map((c) => pipe(memory, M.write(c.charCodeAt(0))))
          );

        case "jmp":
          return T.whileT(
            T.of(memory),
            (m) => M.read(m) !== 0,
            (m) => interpretNodes(node.body, m)
          );

        default:
          return absurd(node);
      }
    };

    const interpretNodes = (nodes: Node[], memory: M.Memory): T.Task<M.Memory> =>
      pipe(
        nodes,
        RA.reduce(T.of(memory), (prevInterpretResult, node) =>
          pipe(
            prevInterpretResult,
            T.chain((m) => interpretNode(node, m))
          )
        )
      );

    const memory = M.create(ctx.memorySize, ctx.cellSize);

    return pipe(
      CC.run(ProgramParser(), ctx.code),
      E.match(T.fromIOK(C.error), (nodes) => pipe(interpretNodes(nodes, memory), T.map(constVoid)))
    );
  },
});
