const auth = require("../middlewares/auth.middleware");

module.exports = app => {
  const router = require("express").Router();
  const controller = require("../controllers/billetera.controller.js");

  // CRUD billeteras (todas requieren token)
  router.post("/", auth, controller.crearBilletera);
  router.get("/", auth, controller.obtenerBilleteras);
  router.put("/:id", auth, controller.actualizarSaldo);
  router.delete("/:id", auth, controller.eliminarBilletera);

  app.use("/api/billeteras", router);
};
