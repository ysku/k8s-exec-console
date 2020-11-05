import React, { useEffect, useRef } from 'react';
import './App.css';
import { Terminal } from 'xterm';
import "xterm/css/xterm.css";
import io from 'socket.io-client';
import { FitAddon } from 'xterm-addon-fit';

const socket = io('localhost:30000');
const shellprompt = '$ ';

function App(props: { initialLine?: string }) {
  const initialLine = props.initialLine || ""
  const termElm = useRef(null);
  let currentLine = "";
  let position = 0;
  const terminal = new Terminal({});
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.onKey(key => {
    const char = key;
    if (char.domEvent.code === "Backspace") {
      if (currentLine.length > 0) {
        currentLine = currentLine.slice(0, -1)
        terminal.write("\b \b")
      }
      return
    }
    if (char.domEvent.code === "ArrowUp") {
      // TODO: history
      return
    }
    if (char.domEvent.code === "ArrowRight") {
      if (position < currentLine.length) {
        position++
        terminal.write(char.key)
      } else {
        // do nothing
        return
      }
    }
    if (char.domEvent.code === "ArrowLeft") {
      if (position > 0) {
        position--
        terminal.write(char.key)
      } else {
        // do nothing
        return
      }
    }
    // https://github.com/xtermjs/xterm.js/issues/2565
    if (char.domEvent.code === "Enter") {
      if (currentLine.length > 0) {
        terminal.writeln("")
        socket.emit('message', currentLine)
      } else {
        terminal.writeln("")
        terminal.write(shellprompt)
      }
      currentLine = ""
      position = 0
    } else {
      position++
      terminal.write(char.key)
      currentLine += char.key
    }
  });
  socket.on('message', (d: string) => {
    if (d.endsWith('\n')) {
      d = d.slice(0, d.length - 1)
    }
    for (const line of d.split('\n')) {
      terminal.writeln(line)
    }
    terminal.write(shellprompt)
  });

  useEffect(() => {
    terminal.open(termElm.current as any)
    terminal.write(shellprompt)

    fitAddon.fit();
  }, [initialLine]);

  return (
    <div className="App">
      <div className="container">
        <div style={{padding:'10px'}}>
          <div ref={termElm}></div>
        </div>
      </div>
    </div>
  );
}

export default App;
