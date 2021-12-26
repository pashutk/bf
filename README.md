# BF interpreter

BF language interpreter ([read more](#problem) about the problem) written in typescript with gradual improvement steps.

The main idea of this exercise is to write simple interpreter and then improve it step by step until it looks like overengineered functional program. Anyway there are lot of cool concepts and approaches used so it still may be an interesting reading. It's recommended to go through this repo in order in which steps to improve the solution taken (look at the [list of them](#steps) below).

You can run every step code by using commands in `package.json`.

## Problem

BF program is a sequence of ascii chars. `><+-.,[]` chars are commands and any other char should be considered comment.

**Task: write an interpreter which can run BF program**

- An interpreter gets BF program, allocates cell array, and runs the program.
- Memory is a >=30_000 memory cells, each one cell store uint8 value.
- At the start of the program execution memory should be initialized with zero values.
- There is a pointer which points on first memory cell when execution starts.

| Command | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `>`     | Move the pointer to the right                                     |
| `<`     | Move the pointer to the left                                      |
| `+`     | Increment the memory cell at the pointer                          |
| `-`     | Decrement the memory cell at the pointer                          |
| `.`     | Output the character signified by the cell at the pointer         |
| `,`     | Input a character and store it in the cell at the pointer         |
| `[`     | Jump past the matching ] if the cell at the pointer is 0          |
| `]`     | Jump back to the matching [ if the cell at the pointer is nonzero |

All characters other than `><+-.,[]` should be considered comments and ignored.

## Steps

1.  [Naive implementation](./01-naive/) (simple straightforward solution)
2.  [A little cleanup](./02-runtime-and-programs/) (added runtime helpers and bf program examples)
3.  [Parser combinators](./03-parser/) (added parsing of bf source code and interpreting resulting ast)
4.  [Zipper](./04-zipper/) (added bf memory model using zipper data structure)
5.  [IO monad](./05-task) (since there IO involved IO monad can help with composition of side effects)
6.  [Reader monad](./06-taskreader/) (wrapped everything into Reader monad to improve ergonomics of working with shared environment)
7.  [Intermediate representation](./07-ir/) (added ir to leverage some basic optimizations)
