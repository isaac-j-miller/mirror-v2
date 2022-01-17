import { Socket } from "socket.io-client";

const originalConsole = { ...console };

export const patchConsole = (socket: Socket) => {
  try {
    console.log = (...args: any[]) => {
      const time = new Date().valueOf();
      originalConsole.log(...args);
      socket.emit("log", { level: "log", args, time });
    };
    console.debug = (...args: any[]) => {
      const time = new Date().valueOf();
      originalConsole.debug(...args);
      socket.emit("log", { level: "debug", args, time });
    };
    console.info = (...args: any[]) => {
      const time = new Date().valueOf();
      originalConsole.info(...args);
      socket.emit("log", { level: "info", args, time });
    };
    console.warn = (...args: any[]) => {
      const time = new Date().valueOf();
      originalConsole.warn(...args);
      socket.emit("log", { level: "warn", args, time });
    };
    console.error = (...args: any[]) => {
      const time = new Date().valueOf();
      originalConsole.error(...args);
      socket.emit("log", { level: "error", args, time });
    };
  } catch (err) {
    console.error(`Unable to patch console`, err);
    const time = new Date().valueOf();
    socket.emit("log", {
      level: "error",
      args: ["Unable to patch console", err],
      time,
    });
  }
};
export const unpatchConsole = () => {
  console = { ...originalConsole };
};
