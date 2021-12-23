import { absurd, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";

import * as CC from "parser-ts/code-frame";

import { runtime } from "../02-runtime-and-programs/runtime-node";
import { gameOfLife, helloWorld } from "../02-runtime-and-programs/programs";
import { runMain } from "../02-runtime-and-programs/runtime";
import { ProgramP as ProgramParser, Node } from "../03-parser/parser";

import * as M from "./memory";

runMain({
  code: helloWorld,
  runtime,
  memorySize: 30_000,

  main: async ({ code, ioRead, ioWrite, memorySize }) => {
    const parsed = CC.run(ProgramParser(), code);
    if (E.isLeft(parsed)) {
      throw new Error(parsed.left);
    }

    const interpretNode = async (n: Node, m: M.Memory): Promise<M.Memory> => {
      switch (n._) {
        case "mvr":
          return M.right(m);

        case "mvl":
          return M.left(m);

        case "cmt":
          return m;

        case "inc":
          return M.inc(m);

        case "dec":
          return M.dec(m);

        case "iow":
          ioWrite(String.fromCharCode(M.read(m)));
          return m;

        case "ior":
          const c = await ioRead();
          const charCode = c.charCodeAt(0);
          return pipe(m, M.write(charCode));

        case "jmp": {
          const { body } = n;
          let memory = m;
          while (M.read(memory) !== 0) {
            for (const node of body) {
              memory = await interpretNode(node, memory);
            }
          }
          return memory;
        }

        default:
          return absurd(n);
      }
    };

    const nodes = parsed.right;
    let memory = M.create(memorySize, 256);

    for (const node of nodes) {
      memory = await interpretNode(node, memory);
    }
  },
});
