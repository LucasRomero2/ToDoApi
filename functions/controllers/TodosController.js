const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = !admin.apps.length ? admin.initializeApp() : admin.app();
const db = app.firestore();
const todosCtrl = {};

function formatDate(date) {
  return date.toLocaleDateString("es-AR");
}

/* Get all todos from Firestore */
todosCtrl.getTodos = async (req, res) => {
  const todosResponse = [];
  try {
    const todosQuery = await db.collection("todos").get();

    todosQuery.forEach((doc) => {
      const date = doc.data().date.toDate();

      todosResponse.push({
        ...doc.data(),
        id: doc.id,
        date: formatDate(date),
      });
    });

    return res.status(200).json(todosResponse);
  } catch (error) {
    functions.logger.error(`Error obteniendo todos los todos`, error);
    return res.status(400).send("Error obteniendo todos los todos");
  }
};

/* Get specific todo by id */
todosCtrl.getTodo = async (req, res) => {
  const id = req.params.id;

  try {
    const todo = await db.collection("todos").doc(id).get();

    if (todo.exists) {
      return res.status(200).json({
        ...todo.data(),
        id: todo.id,
        date: todo.data().date.toDate(),
      });
    } else {
      functions.logger.error(`No se encontro el todo con id: ${id}`);
      return res.status(400).send(`No se encontro el todo con id: ${id}`);
    }
  } catch (error) {
    functions.logger.error(`Error obteniendo todo con id: ${id}`, error);
    return res.status(400).send(`Error obteniendo todo con id: ${id}`);
  }
};

/* Create a todo */
todosCtrl.createTodo = async (req, res) => {
  try {
    const newDate = new Date(req.body.date);
    req.body.date = admin.firestore.Timestamp.fromDate(newDate);

    const todoCreated = await db.collection("todos").add(req.body);
    return res
      .status(201)
      .json(`Se ha creado el todo con id: ${todoCreated.id}`);
  } catch (error) {
    functions.logger.error("Error creando el todo", error);

    return res.status(400).send("Error creando el todo");
  }
};

/* Edit a todo */
todosCtrl.updateTodo = async (req, res) => {
  const id = req.params.id;

  try {
    const todoRef = db.collection("todos").doc(id);
    const todoToEdit = await todoRef.get();

    if (todoToEdit.exists) {
      const newDate = new Date(req.body.date);
      req.body.date = admin.firestore.Timestamp.fromDate(newDate);
      
      await todoRef.update(req.body);
      const todoEdited = await todoRef.get();
      return res
        .status(200)
        .json(`Se ha editado el todo con id: ${todoEdited.id}`);
    } else {
      functions.logger.error(`No se encontro el todo con id: ${id}`);
      return res.status(400).send(`No se encontro el todo con id: ${id}`);
    }
  } catch (error) {
    functions.logger.error(`Error actualizando todo con id: ${id}`, error);

    return res.status(400).send("Error editando el todo");
  }
};

/* Delete a todo */
todosCtrl.deleteTodo = async (req, res) => {
  const id = req.params.id;

  try {
    await db.collection("todos").doc(id).delete();

    return res.status(200).json("Todo eliminado");
  } catch (error) {
    functions.logger.error(`Error eliminando todo con id: ${id}`, error);

    return res.status(400).send("Error eliminando el todo");
  }
};

module.exports = todosCtrl;
