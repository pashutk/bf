import { gameOfLife } from "./programs";
import { runMain } from "./runtime";
import { runtime } from "./runtime-node";

runMain({
  code: gameOfLife,
  runtime,
  memorySize: 30_000,

  main: async (ctx) => {
    const prog = ctx.code;

    const memsize = ctx.memorySize;

    const memory = new Uint8Array(memsize);

    let pointer = 0;

    const loopStarts = [];

    // >	Move the pointer to the right
    // <	Move the pointer to the left
    // +	Increment the memory cell at the pointer
    // -	Decrement the memory cell at the pointer
    // .	Output the character signified by the cell at the pointer
    // ,	Input a character and store it in the cell at the pointer
    // [	Jump past the matching ] if the cell at the pointer is 0
    // ]	Jump back to the matching [ if the cell at the pointer is nonzero
    let progPointer = 0;
    while (progPointer !== prog.length) {
      const sym = prog[progPointer];
      const memval = memory[pointer];
      // console.log(
      //   `prog: ${sym}, pp: ${progPointer}, loopstarts: ${JSON.stringify(
      //     loopStarts
      //   )}, memval: ${memval}`
      // );
      const jmpToMatchingClose = () => {
        let s = 1;
        while (s !== 0) {
          progPointer++;
          if (progPointer === prog.length) {
            throw new Error("Invalid syntax: Cannot find matching ]");
          }

          const subsym = prog[progPointer];
          if (subsym === "[") {
            s++;
          } else if (subsym === "]") {
            s--;
          }
        }
      };
      switch (sym) {
        case ">":
          pointer = pointer > memsize - 1 ? 0 : pointer + 1;
          progPointer++;
          break;
        case "<":
          pointer = pointer === 0 ? memsize - 1 : pointer - 1;
          progPointer++;
          break;
        case "+":
          memory[pointer] = memval + 1;
          progPointer++;
          break;
        case "-":
          memory[pointer] = memval - 1;
          progPointer++;
          break;
        case ".":
          ctx.ioWrite(String.fromCharCode(memval));
          progPointer++;
          break;
        case ",": {
          const ch = await ctx.ioRead();
          // console.log(ch, ch.charCodeAt(0));
          memory[pointer] = ch.charCodeAt(0);
          progPointer++;
          break;
        }
        case "[":
          if (memval === 0) {
            const jmpToMatchingClose = () => {
              let s = 1;
              while (s !== 0) {
                progPointer++;
                if (progPointer === prog.length) {
                  throw new Error("Invalid syntax: Cannot find matching ]");
                }

                const subsym = prog[progPointer];
                if (subsym === "[") {
                  s++;
                } else if (subsym === "]") {
                  s--;
                }
              }
            };
            jmpToMatchingClose();
            progPointer++;
          } else {
            loopStarts.push(progPointer);
            progPointer++;
          }
          break;
        case "]": {
          if (memval !== 0) {
            const loopStart = loopStarts.pop();
            if (loopStart === undefined) {
              throw new Error("Invalid syntax: cannot find matching [");
            }
            progPointer = loopStart;
          } else {
            loopStarts.pop();
            progPointer++;
          }
          break;
        }
        default:
          progPointer++;
          break;
      }
    }

    // console.log(memory.slice(0, 10));
  },
});
