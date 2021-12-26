# 01-naive

Naive and straightforward implementation of the interpreter.

Nothing really much to comment there apart from that `Uint8Array` is used to model bf memory (appropriate uint overflow behavior right out of the box, yay) and function `jmpToMatchingBracket` used when its needed to jump to matching brace (`[]` operations). Interpreter is supposed to run on node (stdout and stdin streams are used for IO).
