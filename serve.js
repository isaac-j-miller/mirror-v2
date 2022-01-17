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

const distFolderPath = path.resolve("dist");
app.get("/", function (req, res) {
  res.sendFile(path.join(distFolderPath, "index.html"));
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

  console.log(`[${res.statusCode}] GET ${fpath}`);
});

const socketServer = new io.Server(server);
const getDistHash = async () => {
  const resp = await asyncExec(
    `find ${distFolderPath} -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum`
  );
  return resp.stdout;
};
socketServer.on("connection", (socket) => {
  console.log("connection established");
  // start monitoring build folder
  let distHash = undefined;
  const interval = setInterval(() => {
    getDistHash()
      .then((hash) => {
        if (distHash !== undefined && distHash !== hash) {
          console.log("change detected; requesting reload");
          socket.emit("reload");
        }
        distHash = hash;
      })
      .catch(console.error);
  }, 1000);
  socket.on("log", ({ level, args }) => {
    const fmt = `[WEB] ${level.toUpperCase()}`;
    if (["debug", "info", "warn", "error", "log"].includes(level)) {
      console[level](fmt, ...args);
    } else {
      console.log(fmt, ...args);
    }
  });
  socket.on("disconnect", function () {
    console.log("disconnected");
    clearInterval(interval);
  });
});

server.listen(3000, () => {
  console.log("listening at http://localhost:3000");
});
