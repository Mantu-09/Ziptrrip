const { randomUUID } = require("crypto");
const { readAll, writeAll } = require("../helpers/db");

function listTodos(req, res) {
  res.json(readAll());
}

function getTodo(req, res) {
  const todo = readAll().find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
}

function createTodo(req, res) {
  const { title, description = "", priority = "medium", dueDate = null } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }

  const todo = {
    id:          randomUUID(),
    title:       title.trim(),
    description: description.trim(),
    completed:   false,
    priority,    // "low" | "medium" | "high"
    dueDate,     // ISO date string or null
    createdAt:   new Date().toISOString(),
  };

  const todos = readAll();
  todos.push(todo);
  writeAll(todos);

  res.status(201).json(todo);
}

function updateTodo(req, res) {
  const todos = readAll();
  const index = todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Todo not found" });

  const { title, description, completed, priority, dueDate } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "title cannot be empty" });
  }

  const updated = {
    ...todos[index],
    ...(title       !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(completed   !== undefined && { completed: Boolean(completed) }),
    ...(priority    !== undefined && { priority }),
    ...(dueDate     !== undefined && { dueDate }),
  };

  todos[index] = updated;
  writeAll(todos);
  res.json(updated);
}

function deleteTodo(req, res) {
  const todos    = readAll();
  const filtered = todos.filter((t) => t.id !== req.params.id);

  if (filtered.length === todos.length) {
    return res.status(404).json({ error: "Todo not found" });
  }

  writeAll(filtered);
  res.status(204).send();
}

module.exports = { listTodos, getTodo, createTodo, updateTodo, deleteTodo };
