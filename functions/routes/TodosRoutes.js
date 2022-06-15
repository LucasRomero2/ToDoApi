const { Router } = require("express");
const router = Router();

const {
  getTodos,
  createTodo,
  getTodo,
  deleteTodo,
  updateTodo,
} = require("../controllers/TodosController");

router.route("/").get(getTodos).post(createTodo);

router.route("/:id").get(getTodo).put(updateTodo).delete(deleteTodo);

module.exports = router;
