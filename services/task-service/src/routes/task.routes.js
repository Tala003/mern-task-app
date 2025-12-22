const router = require("express").Router();
const controller = require("../controllers/task.controller");

router.post("/", controller.addTask);
router.get("/", controller.getTasks);
router.delete("/:id", controller.deleteTask);

module.exports = router;
