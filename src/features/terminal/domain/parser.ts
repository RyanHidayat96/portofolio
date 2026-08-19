import type { ParsedTerminalInput } from "./types";

export function parseTerminalInput(input: string): ParsedTerminalInput | null {
  const tokens = Array.from(input.trim().matchAll(/"([^"]+)"|'([^']+)'|(\S+)/g)).map(
    (match) => match[1] ?? match[2] ?? match[3] ?? ""
  );

  if (tokens.length === 0) {
    return null;
  }

  const [commandName, ...args] = tokens;

  return {
    commandName: commandName.toLowerCase(),
    args
  };
}
