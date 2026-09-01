const fs   = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "todos.json");

/** Read all todos from disk. Returns an array. */
function readAll() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Overwrite the file with the given array. */
function writeAll(todos) {
  fs.writeFileSync(DB_PATH, JSON.stringify(todos, null, 2), "utf8");
}

module.exports = { readAll, writeAll };
