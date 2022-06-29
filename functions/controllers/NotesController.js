const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = !admin.apps.length ? admin.initializeApp() : admin.app();
const db = app.firestore();
const notesCtrl = {};

function formatDate(date) {
  return date.toLocaleDateString("es-AR");
}

/* Get all notes from Firestore */
notesCtrl.getNotes = async (req, res) => {
  const notesResponse = [];
  try {
    const notesQuery = await db.collection("notes").get();

    notesQuery.forEach((doc) => {
      notesResponse.push({
        ...doc.data(),
        id: doc.id,
        date: formatDate(doc.data().date.toDate()),
      });
    });

    return res.status(200).json(notesResponse);
  } catch (error) {
    functions.logger.error(`Error obteniendo todas las notas`, error);
    return res.status(400).send("Error obteniendo todas las notas");
  }
};

/* Get specific note by id */
notesCtrl.getNote = async (req, res) => {
  const id = req.params.id;

  try {
    const note = await db.collection("notes").doc(id).get();
    if (note.exists) {
      return res
        .status(200)
        .json({
          id: note.id,
          ...note.data(),
          date: formatDate(note.data().date.toDate()),
        });
    } else {
      functions.logger.error(`No se encontro la nota con id: ${id}`);
      return res.status(400).send(`No se encontro la nota con id: ${id}`);
    }
  } catch (error) {
    functions.logger.error(`Error obteniendo nota con id: ${id}`, error);
    return res.status(400).send(`Error obteniendo nota con id: ${id}`);
  }
};

/* Create a note */
notesCtrl.createNote = async (req, res) => {
  try {
    const newDate = new Date(req.body.date);

    const newNote = {
      title: req.body.title,
      desc: req.body.desc,
      date: admin.firestore.Timestamp.fromDate(newDate),
      // userId: req.body["userId"], TODO: add userId
    };

    const noteCreated = await db.collection("notes").add(newNote);
    return res
      .status(201)
      .json(`Se ha creado la nota con id: ${noteCreated.id}`);
  } catch (error) {
    functions.logger.error("Error creando la nota", error);

    return res.status(400).send("Error creando la nota");
  }
};

/* Edit a note */
notesCtrl.updateNote = async (req, res) => {
  const id = req.params.id;

  try {
    const noteRef = db.collection("notes").doc(id);
    const noteToEdit = await noteRef.get();

    if (noteToEdit.exists) {
      const newDate = new Date(req.body.date);
      console.log("🚀 ~ file: NotesController.js ~ line 89 ~ notesCtrl.updateNote= ~ newDate", newDate)
      req.body.date = admin.firestore.Timestamp.fromDate(newDate);

      const editNote = {
        title: req.body.title,
        desc: req.body.desc,
        date: req.body.date,
      };

      await noteRef.update(editNote);
      const noteEdited = await noteRef.get();
      return res
        .status(200)
        .json(`Se ha editado la nota con id: ${noteEdited.id}`);
    } else {
      functions.logger.error(`No se encontro la nota con id: ${id}`);
      return res.status(400).send(`No se encontro la nota con id: ${id}`);
    }
  } catch (error) {
    functions.logger.error(`Error actualizando nota con id: ${id}`, error);

    return res.status(400).send("Error editando la nota");
  }
};

/* Delete a note */
notesCtrl.deleteNote = async (req, res) => {
  const id = req.params.id;

  try {
    await db.collection("notes").doc(id).delete();

    return res.status(200).json("Nota eliminada");
  } catch (error) {
    functions.logger.error(`Error eliminando nota con id: ${id}`, error);

    return res.status(400).send("Error eliminando la nota");
  }
};

module.exports = notesCtrl;
