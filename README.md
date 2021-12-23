# BF interpreter

## Problem

BF program is a sequence of ascii chars
`><+-.,[]` chars are commands and any other char should be considered comments

**Task: write an interpreter which can run BF program**

An interpreter gets BF program, allocates cell array, and runs the program
Memory is a >=30_000 memory cells, each one cell store uint8 value
At the start of the program execution memory should be initialized with zero values
There is a pointer which points on first memory cell when execution starts

    Commands:

`>` Move the pointer to the right
`<` Move the pointer to the left
`+` Increment the memory cell at the pointer
`-` Decrement the memory cell at the pointer
`.` Output the character signified by the cell at the pointer
`,` Input a character and store it in the cell at the pointer
`[` Jump past the matching ] if the cell at the pointer is 0
`]` Jump back to the matching [ if the cell at the pointer is nonzero

    All characters other than ><+-.,[] should be considered comments and ignored.
