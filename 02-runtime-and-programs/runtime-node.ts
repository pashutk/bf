import { stdin, stdout } from "process";
import { Runtime } from "./runtime";

export const runtime: Runtime = {
  init() {
    stdin.pause();
    stdin.setEncoding("ascii");
    stdin.on("end", () => {
      console.log("Reached end of stream.");
    });
  },

  readChar() {
    return new Promise((resolve, reject) => {
      const onReadable = () => {
        const result = stdin.read(1);
        stdin.off("readable", onReadable);
        resolve(result);
      };

      stdin.on("readable", onReadable);
    });
  },

  writeChar(s) {
    stdout.write(s);
  },
};
