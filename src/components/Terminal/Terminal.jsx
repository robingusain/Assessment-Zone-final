import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit"; // 🔥 important
import "xterm/css/xterm.css";
import styles from "./Terminal.module.css";

const TerminalComponent = ({ onRun, setTerminal, setFitAddon}) => {
  const terminalRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#212121",
        foreground: "#ffffff",
      },
      scrollback: 1000, // keeps history instead of overflow
    });

    const fitAddon = new FitAddon();
    setFitAddon(fitAddon);
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);

    // fit terminal to container
    requestAnimationFrame(() => fitAddon.fit());

    // handle resize
    const handleResize = () => {
      requestAnimationFrame(() => fitAddon.fit());
    };
    window.addEventListener("resize", handleResize);

    term.focus();
    setTerminal(term);

    term.write("🟢 Terminal Ready\r\n> ");

    let buffer = "";

    term.onData((data) => {
      if (data === "\r") {
        term.write("\r\n");
        buffer = "";
        term.write("> ");
      } else if (data === "\u007F") {
        buffer = buffer.slice(0, -1);
        term.write("\b \b");
      } else {
        buffer += data;
        term.write(data);
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
      }}
    />
  );
};

export default TerminalComponent;
