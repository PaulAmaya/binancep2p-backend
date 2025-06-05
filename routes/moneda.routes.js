const auth = require("../middlewares/auth.middleware");
const requireAdmin = require("../middlewares/require-admin");

module.exports = app => {
  const router = require("express").Router();
  const controller = require("../controllers/moneda.controller.js");

  // Rutas protegidas y restringidas
  router.post("/", auth, requireAdmin, controller.crearMoneda);
  router.put("/:id", auth, requireAdmin, controller.actualizarMoneda);
  router.delete("/:id", auth, requireAdmin, controller.eliminarMoneda);
  router.get("/:id", auth, controller.obtenerMonedaPorId);

  // Ruta protegida pero abierta para cualquier usuario autenticado
  router.get("/", auth, controller.listarMonedas);

  app.use("/api/monedas", router);
};
