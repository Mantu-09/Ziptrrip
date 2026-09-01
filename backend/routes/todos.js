const express = require("express");
const router  = express.Router();
const {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todosController");

router.get("/",     listTodos);
router.get("/:id",  getTodo);
router.post("/",    createTodo);
router.put("/:id",  updateTodo);
router.delete("/:id", deleteTodo);

module.exports = router;
