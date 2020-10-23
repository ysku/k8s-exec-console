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
  const terminal = new Terminal({});
  const fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);
  terminal.onKey(key => {
    const char = key;
    // https://github.com/xtermjs/xterm.js/issues/2565
    if (char.key === "\r") {
      terminal.writeln("")
      terminal.write(shellprompt)
      socket.emit('message', currentLine)
      currentLine = ""
    } else {
      terminal.write(char.key)
      currentLine += char.key
    }
  });
  socket.on('message', (d: string) => terminal.write(d));

  useEffect(() => {
    terminal.open(termElm.current as any)
    terminal.write(shellprompt)

    fitAddon.fit();
  }, [initialLine]);

  return (
    <div className="App">
      <div style={{padding:'10px'}}>
        <div ref={termElm}></div>
      </div>
    </div>
  );
}

export default App;
