'use client';

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { EngineProps } from '../../types/game';

interface CommandStep {
  command: string;
  nextPrompt?: string;
  simulatedOutput?: string;
}

interface CliExecPayload {
  prompt: string;
  successCommands?: string[];
  sequence?: CommandStep[];
  simulatedOutput?: string;
}

export default function CliExecEngine({
  payload,
  onWin,
  isActive
}: EngineProps<CliExecPayload>) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const inputBuffer = useRef<string>('');
  const isActiveRef = useRef<boolean>(isActive);

  const isPowerShell = payload.prompt.trim().startsWith('PS');

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const onWinRef = useRef(onWin);
  const successCommandsRef = useRef(payload.successCommands || []);
  const simulatedOutputRef = useRef(payload.simulatedOutput);
  const sequenceRef = useRef(payload.sequence);
  const sequenceIndexRef = useRef(0);
  const currentPromptRef = useRef(payload.prompt);

  useEffect(() => {
    onWinRef.current = onWin;
    successCommandsRef.current = payload.successCommands || [];
    simulatedOutputRef.current = payload.simulatedOutput;
    sequenceRef.current = payload.sequence;
  }, [onWin, payload]);

  useEffect(() => {
    if (!terminalRef.current) return;
    
    terminalRef.current.innerHTML = '';
    sequenceIndexRef.current = 0;
    currentPromptRef.current = payload.prompt;

    const term = new Terminal({
      cursorBlink: true,
      theme: isPowerShell ? {
        background: '#012456',
        foreground: '#ffffff',
        cursor: '#ffffff',
      } : {
        background: '#000000',
        foreground: '#22c55e', 
        cursor: '#22c55e',
      },
      fontFamily: '"Fira Code", monospace',
      fontSize: 14,
    });
    
    termInstance.current = term;
    term.open(terminalRef.current);
    term.focus();
    
    term.write(currentPromptRef.current + ' ');

    const onDataDisposable = term.onData((data) => {
      if (!isActiveRef.current) return;

      const code = data.charCodeAt(0);
      
      // Tab Autocomplete
      if (code === 9) {
        const current = inputBuffer.current;
        let matchStr: string | undefined;
        
        if (sequenceRef.current && sequenceRef.current.length > 0) {
           const targetCmd = sequenceRef.current[sequenceIndexRef.current].command;
           if (targetCmd.toLowerCase().startsWith(current.toLowerCase())) {
               matchStr = targetCmd;
           }
        } else {
           matchStr = successCommandsRef.current.find(cmd => cmd.toLowerCase().startsWith(current.toLowerCase()));
        }
        
        if (matchStr && matchStr.length > current.length) {
          let nextSpace = matchStr.indexOf(' ', current.length);
          if (nextSpace === -1) {
            nextSpace = matchStr.length;
          } else {
            nextSpace += 1;
          }
          
          const addition = matchStr.substring(current.length, nextSpace);
          inputBuffer.current += addition;
          term.write(addition);
        }
        return;
      }
      
      // Enter key
      if (code === 13) {
        const cmd = inputBuffer.current.trim();
        term.writeln('');
        
        if (sequenceRef.current && sequenceRef.current.length > 0) {
          const currentStep = sequenceRef.current[sequenceIndexRef.current];
          if (cmd.toLowerCase() === currentStep.command.toLowerCase()) {
            if (currentStep.simulatedOutput) {
              term.writeln(currentStep.simulatedOutput.replace(/\n/g, '\r\n'));
            }
            
            sequenceIndexRef.current += 1;
            
            if (sequenceIndexRef.current >= sequenceRef.current.length) {
              isActiveRef.current = false;
              onWinRef.current();
            } else {
              const nextPrompt = sequenceRef.current[sequenceIndexRef.current].nextPrompt;
              if (nextPrompt) {
                currentPromptRef.current = nextPrompt;
              }
              term.write(currentPromptRef.current + ' ');
            }
          } else {
            if (cmd.length > 0) {
              term.writeln(isPowerShell 
                ? `${cmd} : The term '${cmd}' is not recognized.` 
                : `bash: ${cmd}: command not found`);
            }
            term.write(currentPromptRef.current + ' ');
          }
        } else if (successCommandsRef.current.some(c => c.toLowerCase() === cmd.toLowerCase())) {
          if (simulatedOutputRef.current) {
            term.writeln(simulatedOutputRef.current.replace(/\n/g, '\r\n'));
          } else {
            term.writeln(isPowerShell ? 'Command completed successfully.' : '\x1b[32m[Execution complete]\x1b[0m');
          }
          
          isActiveRef.current = false;
          onWinRef.current();
        } else {
          if (cmd.length > 0) {
            term.writeln(isPowerShell 
              ? `${cmd} : The term '${cmd}' is not recognized.` 
              : `bash: ${cmd}: command not found`);
          }
          term.write(currentPromptRef.current + ' ');
        }
        inputBuffer.current = '';
      } 
      // Backspace
      else if (code === 127 || code === 8) {
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.substring(0, inputBuffer.current.length - 1);
          term.write('\b \b');
        }
      } 
      // Printable characters
      else if (code >= 32 && code <= 126) {
        inputBuffer.current += data;
        term.write(data);
      }
    });

    return () => {
      onDataDisposable.dispose();
      if (terminalRef.current) {
        terminalRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className={`w-full h-full p-4 border rounded font-mono transition-all duration-300
      ${isPowerShell ? 'bg-[#012456] border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)]' : 'bg-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'}
    `}>
      <div className={`text-sm mb-2 opacity-80 uppercase tracking-widest border-b pb-2
        ${isPowerShell ? 'text-blue-300 border-blue-400/30' : 'text-green-500 border-green-500/30'}
      `}>
        {isPowerShell ? 'Windows PowerShell' : 'Terminal Interface'}
      </div>
      <div 
        ref={terminalRef} 
        className="w-full h-[300px] overflow-hidden" 
      />
    </div>
  );
}
