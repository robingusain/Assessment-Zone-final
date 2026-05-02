import React, { useRef, useState, useEffect } from "react";
import styles from "./EditorPage.module.css";
import Client from "../Client/Client";
import Editor from "../Editor/Editor";
import Chats from "../Chats/Chats";
import { initSocket } from "../../Socket/socket.js";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import ACTIONS from "../../Actions.js";
import toast from "react-hot-toast";
import { Copy, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import TerminalComponent from "../Terminal/Terminal";
import { runCode } from "../../Runner/runCode.js";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef("");
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();

  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState("text/x-c++src");
  const [isRunning, setIsRunning] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [terminal, setTerminal] = useState(null);
  const [fitAddon, setFitAddon] = useState(null);

  const [terminalHeight, setTerminalHeight] = useState(250);
  const isDragging = useRef(false);

  // ================= SOCKET =================
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed");
        reactNavigator("/");
      }

      socketRef.current.on("connect_error", handleErrors);
      socketRef.current.on("connect_failed", handleErrors);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined`);
          }

          setClients(clients);

          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current || "",
            socketId,
          });
        },
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId),
        );
      });
    };

    init();

    return () => {
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // ================= SIDEBAR COLLAPSE FIX =================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitAddon) fitAddon.fit();
    }, 300);

    return () => clearTimeout(timer);
  }, [isCollapsed, fitAddon]);

  // ================= RUN CODE =================
  const handleRun = async (input = "") => {
    if (isRunning || !terminal) return;

    setIsRunning(true);
    terminal.write("\r\n⏳ Running...\r\n");

    try {
      const output = await runCode(codeRef.current || "", language, input);
      terminal.write("\r\nOutput:\r\n");
      const normalizedOutput = output.replace(/\n/g, "\r\n");
      terminal.write(normalizedOutput + "\r\n> ");
      terminal.focus();
    } catch (err) {
      if (err.response?.status === 429) {
        terminal.write(
          "⚠️ Rate limit exceeded. Please wait before running again.\r\n> ",
        );
      } else {
        terminal.write(`❌ Error: ${err.message}\r\n> `);
      }
    }

    setIsRunning(false);
  };

  const handleClearTerminal = () => {
    if (terminal) {
      terminal.clear();
      terminal.write("🟢 Terminal Ready\r\n> ");
      terminal.focus();
    }
  };

  // ================= DRAG LOGIC =================
  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.userSelect = "none";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const container = document.querySelector(`.${styles.editorWrap}`);
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newHeight = rect.bottom - e.clientY;

    if (newHeight < 120) return;

    setTerminalHeight(newHeight);

    // 🔥 FIX: refit terminal
    if (fitAddon) {
      requestAnimationFrame(() => fitAddon.fit());
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = "auto";
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [fitAddon]);

  // ================= UI ACTIONS =================
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state?.username) {
    return <Navigate to="/" />;
  }

  return (
    <div
      className={`${styles.mainWrap} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* Toggle Sidebar */}
      <button
        className={`${styles.toggleBtn} ${
          isCollapsed ? styles.toggleCollapsed : ""
        }`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
      </button>

      {/* Sidebar */}
      <div className={styles.aside}>
        <div className={styles.asideInner}>
          <div className={styles.logo}>
            <img className={styles.logoImage} src="/logo.png" alt="logo" />
          </div>

          <div className={styles.hline}>
            <h3>Connected Users</h3>
          </div>

          <div className={styles.clientList}>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <button
          className={`${styles.btn} ${styles.copyBtn}`}
          onClick={copyRoomId}
        >
          <Copy size={16} /> Copy Room ID
        </button>

        <button
          className={`${styles.btn} ${styles.leaveBtn}`}
          onClick={leaveRoom}
        >
          <LogOut size={16} /> Leave
        </button>
      </div>

      {/* Editor + Terminal */}
      <div className={styles.editorWrap}>
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          language={language}
          setLanguage={setLanguage}
          onCodeChange={(code) => (codeRef.current = code)}
          onRun={handleRun}
          onClear={handleClearTerminal}
          isRunning={isRunning}
        />

        {/* Drag Bar */}
        <div className={styles.dragBar} onMouseDown={handleMouseDown} />

        {/* Terminal */}
        <div
          className={styles.terminal}
          style={{ height: `${terminalHeight}px` }}
        >
          <TerminalComponent
            onRun={handleRun}
            setTerminal={setTerminal}
            setFitAddon={setFitAddon}
          />
        </div>
      </div>

      {/* Chats */}
      <div className={styles.chats}>
        <Chats />
      </div>
    </div>
  );
};

export default EditorPage;