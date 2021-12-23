import { Runtime } from "./runtime";

export const runtime: Runtime = {
  writeChar(s: string) {
    const c = s[0];
    const output = globalThis.document.getElementById("output");
    if (output) {
      output.innerHTML += c;
    }
  },

  init() {
    const output = globalThis.document.getElementById("output");
    if (output) {
      output.innerHTML = "";
    }
  },

  readChar() {
    return new Promise((resolve, reject) => {
      const input = globalThis.document.getElementById("input") as HTMLInputElement;
      const val = input.value;
      if (val.length !== 0) {
        input.value = val.substr(1);
        const char = val[0];
        this.writeChar(char);
        resolve(char);
        return;
      }

      const handler = (e: Event) => {
        const val = input.value;
        input.value = "";
        input.removeEventListener("input", handler);
        this.writeChar(val);
        resolve(val);
      };
      input.addEventListener("input", handler);
    });
  },
};
