"use client";

import { MacTerminal } from "@/registry/klarden-ui/mac-terminal";

export default function MacTerminalDemo() {
  return (
    <div className="relative w-full max-w-full min-h-[440px] sm:min-h-[520px] px-2 sm:px-4 py-4 flex items-center justify-center overflow-hidden">
      <MacTerminal
        username="utkarsh"
        hostname="dev_"
        shell="zsh"
        width={680}
        height={400}
        draggable={true}
        showNeofetch={true}
        onCommand={(cmd) => {
          if (cmd === "hello") return ["Hello from Klarden UI! 🚀"];
          if (cmd === "fortune")
            return [
              "🔮 You will build beautiful UIs today.",
            ];
          return undefined; // fall through to builtins
        }}
      />
    </div>
  );
}

