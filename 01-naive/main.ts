// BF program is a sequence of ascii chars
// ><+-.,[] chars are commands and any other char should be considered comments
//
// Task: write an interpreter which can run BF program
//
// An interpreter gets BF program, allocates cell array, and runs the program
// Memory is a >=30_000 memory cells, each one cell store uint8 value
// At the start of the program execution memory should be initialized with zero values
// There is a pointer which points on first memory cell when execution starts
//
//    Commands:
//
// >	Move the pointer to the right
// <	Move the pointer to the left
// +	Increment the memory cell at the pointer
// -	Decrement the memory cell at the pointer
// .	Output the character signified by the cell at the pointer
// ,	Input a character and store it in the cell at the pointer
// [	Jump past the matching ] if the cell at the pointer is 0
// ]	Jump back to the matching [ if the cell at the pointer is nonzero
//
//    All characters other than ><+-.,[] should be considered comments and ignored.

import { stdin, stdout } from "process";

stdin.pause();
stdin.setEncoding("ascii");

const readOne = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const onReadable = () => {
      const result = stdin.read(1);
      stdin.off("readable", onReadable);
      resolve(result);
    };

    stdin.on("readable", onReadable);
  });

stdin.on("end", () => {
  console.log("Reached end of stream.");
});

const main = async () => {
  const memsize = 30_000;

  const memory = new Uint8Array(memsize);

  let pointer = 0;

  const loopStarts = [];

  // console.log(memory.slice(0, 10));
  // memory[0] = 250;
  // console.log(memory.slice(0, 10));
  // const prog = ">>[-]<<[->>+<<]";

  // hello world
  // const prog =
  // "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.";
  const prog = `[life.b -- John Horton Conway's Game of Life
  (c) 2021 Daniel B. Cristofani
  http://brainfuck.org/]
  
  >>>->+>+++++>(++++++++++)[[>>>+<<<-]>+++++>+>>+[<<+>>>>>+<<<-]<-]>>>>[
    [>>>+>+<<<<-]+++>>+[<+>>>+>+<<<-]>>[>[[>>>+<<<-]<]<<++>+>>>>>>-]<-
  ]+++>+>[[-]<+<[>+++++++++++++++++<-]<+]>>[
    [+++++++++.-------->>>]+[-<<<]>>>[>>,----------[>]<]<<[
      <<<[
        >--[<->>+>-<<-]<[[>>>]+>-[+>>+>-]+[<<<]<-]>++>[<+>-]
        >[[>>>]+[<<<]>>>-]+[->>>]<-[++>]>[------<]>+++[<<<]>
      ]<
    ]>[
      -[+>>+>-]+>>+>>>+>[<<<]>->+>[
        >[->+>+++>>++[>>>]+++<<<++<<<++[>>>]>>>]<<<[>[>>>]+>>>]
        <<<<<<<[<<++<+[-<<<+]->++>>>++>>>++<<<<]<<<+[-<<<+]+>->>->>
      ]<<+<<+<<<+<<-[+<+<<-]+<+[
        ->+>[-<-<<[<<<]>[>>[>>>]<<+<[<<<]>-]]
        <[<[<[<<<]>+>>[>>>]<<-]<[<<<]]>>>->>>[>>>]+>
      ]>+[-<<[-]<]-[
        [>>>]<[<<[<<<]>>>>>+>[>>>]<-]>>>[>[>>>]<<<<+>[<<<]>>-]>
      ]<<<<<<[---<-----[-[-[<->>+++<+++++++[-]]]]<+<+]>
    ]>>
  ]
  
  [This program simulates the Game of Life cellular automaton.
  
  It duplicates the interface of the classic program at
  http://www.linusakesson.net/programming/brainfuck/index.php,
  but this program was written from scratch.
  
  Type e.g. "be" to toggle the fifth cell in the second row, "q" to quit,
  or a bare linefeed to advance one generation.
  
  Grid wraps toroidally. Board size in parentheses in first line (2-166 work).
  
  This program is licensed under a Creative Commons Attribution-ShareAlike 4.0
  International License (http://creativecommons.org/licenses/by-sa/4.0/).]`;

  console.log(prog);

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
        stdout.write(String.fromCharCode(memval));
        progPointer++;
        break;
      case ",": {
        const ch = await readOne();
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
};

main();
