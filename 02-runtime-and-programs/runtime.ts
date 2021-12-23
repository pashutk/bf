export interface Runtime {
  init: () => void;
  readChar: () => Promise<string>;
  writeChar: (char: string) => void;
}

type Char = string;

// Main program (located at main.ts) input: code, io and memsize
type MainCtx = {
  // sequence of ascii chars
  code: string;
  // reads one char from stdin
  ioRead: () => Promise<Char>;
  // writes one char to stdout
  ioWrite: (c: Char) => void;
  // Amount of available memory cells
  memorySize: number;
};

type MainInput = {
  code: string;
  runtime: Runtime;
  main: (mctx: MainCtx) => Promise<void>;
  memorySize: number;
};

// Utility function used for running main program
export const runMain = ({ code, main, runtime, memorySize }: MainInput): void => {
  runtime.init();

  main({
    code,
    ioRead: runtime.readChar,
    ioWrite: runtime.writeChar,
    memorySize,
  });
};
