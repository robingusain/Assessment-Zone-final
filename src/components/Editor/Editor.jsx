import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";

// Modes
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";

// Theme + addons
import "codemirror/theme/material-darker.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import {Play, BrushCleaning} from 'lucide-react' 

import styles from "./Editor.module.css";
import ACTIONS from "../../Actions";

const Editor = ({
  socketRef,
  roomId,
  onCodeChange,
  language,
  setLanguage,
  onRun,
  onClear,
  isRunning,
}) => {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  // const [language, setLanguage] = useState("text/x-c++src");

  // 🔥 Boilerplates
  const boilerplates = {
    javascript: `// JavaScript
function main() {
  console.log("Hello JavaScript");
}
main();`,

    python: `# Python
def main():
    print("Hello Python")

if __name__ == "__main__":
    main()`,

    "text/x-c++src": `// C++
#include <iostream>
using namespace std;

int main() {
  cout << "Hello C++";
  return 0;
}`,

    "text/x-java": `// Java
class Main {
  public static void main(String[] args) {
    System.out.println("Hello Java");
  }
}`,
  };

  // Initialize editor
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(textareaRef.current, {
        mode: language,
        theme: "material-darker",
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      });
      // Set initial boilerplate
      editorRef.current.setValue(boilerplates[language]);

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          if (socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  // Handle language change
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setOption("mode", language);

      // Always Update boilerplate
      editorRef.current.setValue(boilerplates[language] || "");
    }
  }, [language]);

  return (
    <div className={styles.editorContainer}>
      {/* Language Selector */}
      <div className={styles.topBar}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="text/x-c++src">C++</option>
          <option value="text/x-java">Java</option>
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
        <button
          className={`${styles.runBtn} ${styles.btn}`}
          onClick={() => onRun("")}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : (
            <>
              <Play size={15} strokeWidth={2.5}/>
              Run
            </>
          )}
        </button>
        
        <button className={`${styles.clearBtn} ${styles.btn}`} onClick={onClear}>
          <>
            <BrushCleaning size={16} strokeWidth={2} />
            Clear Terminal
          </>
        </button>
      </div>

      {/* Editor */}
      <div className={styles.editorWrapper}>
        <textarea ref={textareaRef}></textarea>
      </div>
    </div>
  );
};

export default Editor;
