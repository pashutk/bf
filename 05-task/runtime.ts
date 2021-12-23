import { Runtime } from "../02-runtime-and-programs/runtime";
import * as T from "fp-ts/Task";
import * as IO from "fp-ts/IO";

export * from "../02-runtime-and-programs/runtime";

type Char = string;

// Main program (located at main.ts) input: code, io and memsize
type MainCtx = {
  // sequence of ascii chars
  code: string;
  // reads one char from stdin
  ioRead: T.Task<Char>;
  // writes one char to stdout
  ioWrite: (c: Char) => T.Task<void>;
  // Amount of available memory cells
  memorySize: number;
  // Size of uint cell in memory
  cellSize: number;
};

type MainInput = {
  code: string;
  runtime: Runtime;
  main: (mctx: MainCtx) => T.Task<void>;
  memorySize: number;
  cellSize: number;
};

// Utility function used for running main program Task
export const runMainTask = ({ code, main, runtime, memorySize, cellSize }: MainInput): Promise<void> => {
  runtime.init();

  const task = main({
    code,
    ioRead: runtime.readChar,
    ioWrite: T.fromIOK((c) => () => {
      runtime.writeChar(c);
    }),
    memorySize,
    cellSize,
  });

  return task();
};
