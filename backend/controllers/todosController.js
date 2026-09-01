const { randomUUID } = require("crypto");
const { readAll, writeAll } = require("../helpers/db");

// GET /todos
function listTodos(req, res) {
  const todos = readAll();
  res.json(todos);
}

// GET /todos/:id
function getTodo(req, res) {
  const todos = readAll();
  const todo  = todos.find((t) => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
}

// POST /todos
function createTodo(req, res) {
  const { title, description = "", priority = "medium", dueDate = null } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }

  const newTodo = {
    id:          randomUUID(),
    title:       title.trim(),
    description: description.trim(),
    completed:   false,
    priority,          // "low" | "medium" | "high"
    dueDate,           // ISO date string or null
    createdAt:   new Date().toISOString(),
  };

  const todos = readAll();
  todos.push(newTodo);
  writeAll(todos);

  res.status(201).json(newTodo);
}

// PUT /todos/:id
function updateTodo(req, res) {
  const todos = readAll();
  const index = todos.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Todo not found" });

  const existing = todos[index];
  const { title, description, completed, priority, dueDate } = req.body;

  // Validate title if provided
  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return res.status(400).json({ error: "title cannot be empty" });
  }

  const updated = {
    ...existing,
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

// DELETE /todos/:id
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
