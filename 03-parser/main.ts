import { absurd } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";

import * as CC from "parser-ts/code-frame";

import { runtime } from "../02-runtime-and-programs/runtime-node";
import { gameOfLife, helloWorld } from "../02-runtime-and-programs/programs";
import { runMain } from "../02-runtime-and-programs/runtime";

import { ProgramP as parser, Node } from "./parser";

runMain({
  code: gameOfLife,
  runtime,
  memorySize: 30_000,

  main: async ({ code, ioRead, ioWrite, memorySize }) => {
    const parsed = CC.run(parser(), code);
    if (E.isLeft(parsed)) {
      throw new Error(parsed.left);
    }

    const memory = new Uint8Array(memorySize);
    let pointer = 0;

    const interpretNode = async (n: Node): Promise<void> => {
      switch (n._) {
        case "mvr":
          pointer = pointer > memorySize - 1 ? 0 : pointer + 1;
          break;

        case "mvl":
          pointer = pointer === 0 ? memorySize - 1 : pointer - 1;
          break;

        case "cmt":
          break;

        case "inc":
          memory[pointer] = memory[pointer] + 1;
          break;

        case "dec":
          memory[pointer] = memory[pointer] - 1;
          break;

        case "iow":
          ioWrite(String.fromCharCode(memory[pointer]));
          break;

        case "ior":
          const c = await ioRead();
          memory[pointer] = c.charCodeAt(0);
          break;

        case "jmp": {
          const { body } = n;
          while (memory[pointer] !== 0) {
            for (const node of body) {
              await interpretNode(node);
            }
          }
          break;
        }

        default:
          return absurd(n);
      }
    };

    const nodes = parsed.right;
    for (const node of nodes) {
      await interpretNode(node);
    }
  },
});
