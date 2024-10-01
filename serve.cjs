const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");
const express = require("express");
const io = require("socket.io");
const http = require("http");
const { promisify } = require("util");

const asyncExec = promisify(exec);
const app = express();

const server = http.Server(app);

const getLevel = (level) =>
  ["debug", "info", "warn", "error", "log"].includes(level) ? level : "log";

const originalConsole = { ...console };
const log = (level, args) => {
  const useLevel = getLevel(level);
  originalConsole[useLevel](
    `[${level.toUpperCase()}]\t${new Date().toISOString()}\t[server]\t`,
    ...args
  );
};

console = {
  log: (...args) => log("log", args),
  debug: (...args) => log("debug", args),
  info: (...args) => log("info", args),
  warn: (...args) => log("warn", args),
  error: (...args) => log("error", args),
};

const distFolderPath = path.resolve("dist");
app.get("/", function (_req, res) {
  res.sendFile(path.join(distFolderPath, "index.html"));
});
app.post("/kill", function (_req, res) {
  console.warn("Kill signal received");
  res.status(200).send();
  res.once("close", () => {
    process.exit(0);
  });
});
app.get("/:fpath(*)", (req, res) => {
  const { fpath } = req.params;
  const filepath = path.join(distFolderPath, fpath);
  const exists = fs.existsSync(filepath);
  if (!exists) {
    res.status(404);
    res.send();
  } else {
    res.sendFile(filepath);
  }
  console.log(`GET ${fpath} (${res.statusCode})`);
});

const socketServer = new io.Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
const getDistHash = async () => {
  const resp = await asyncExec(
    `find ${distFolderPath} -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum`
  );
  return resp.stdout;
};
socketServer.on("connection", (socket) => {
  console.debug("connection established");
  // start monitoring build folder
  let distHash = undefined;
  const interval = setInterval(() => {
    getDistHash()
      .then((hash) => {
        if (distHash !== undefined && distHash !== hash) {
          console.debug(`change detected; requesting reload`);
          socket.emit("reload");
        }
        distHash = hash;
      })
      .catch(console.error);
  }, 1000);
  socket.on("log", ({ level, args, time }) => {
    const ts = new Date(time).toISOString();
    const fmt = `[${level.toUpperCase()}]\t${ts}\t[web]\t`;
    const useLevel = getLevel(level);
    originalConsole[useLevel](fmt, ...args);
  });
  socket.on("disconnect", function () {
    console.debug("disconnected");
    clearInterval(interval);
  });
});

socketServer.listen(3333);
server.listen(3000, () => {
  console.info("listening at http://localhost:3000");
});
