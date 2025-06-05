const auth = require("../middlewares/auth.middleware");

module.exports = app => {
  const router = require("express").Router();
  const controller = require("../controllers/anuncio.controller.js");

  router.post("/", auth, controller.crearAnuncio);
  router.get("/", auth, controller.listarAnuncios);
  router.get("/:id", auth, controller.obtenerAnuncioPorId);
  router.put("/:id/finalizar", auth, controller.finalizarAnuncio);

  app.use("/api/anuncios", router);
};
