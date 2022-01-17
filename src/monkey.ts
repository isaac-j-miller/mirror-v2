import { Socket } from "socket.io-client";

const originalConsole = { ...console };

export const patchConsole = (socket: Socket) => {
  console.log = (...args: any[]) => {
    originalConsole.log(...args);
    socket.emit("log", { level: "log", args });
  };
  console.debug = (...args: any[]) => {
    originalConsole.debug(...args);
    socket.emit("log", { level: "debug", args });
  };
  console.info = (...args: any[]) => {
    originalConsole.info(...args);
    socket.emit("log", { level: "info", args });
  };
  console.warn = (...args: any[]) => {
    originalConsole.warn(...args);
    socket.emit("log", { level: "warn", args });
  };
  console.error = (...args: any[]) => {
    originalConsole.error(...args);
    socket.emit("log", { level: "error", args });
  };
};
export const unpatchConsole = () => {
  console = { ...originalConsole };
};
