# 02-runtime-and-programs

Cleanup, mostly. There is a common infrastructure to run the interpreter which includes providing io interface, running initialization, providing source code of bf program. All of this is moved to `runtime` module. Two runtime instances available, one for browser and one for nodejs. Nodejs one will be used most of the time.

Also examples of bf programs provided in `programs` module, for now there are two of them:

- helloWorld, which is obviously a program that outputs `Hello, World!` string
- gameOfLife, which is Conway's Game of Life and [this Wikipedia article](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) can explain everything
