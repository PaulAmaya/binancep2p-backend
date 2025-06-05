const auth = require("../middlewares/auth.middleware");

module.exports = app => {
  const router = require("express").Router();
  const controller = require("../controllers/transaccion.controller.js");

  router.post("/", auth, controller.crearTransaccion);
  router.post("/comprar", auth, controller.realizarCompra);
  router.put("/:id", auth, controller.actualizarEstado);
  router.get("/billetera/:id", auth, controller.verPorBilletera);
  router.put('/:id/responder', auth,controller.responderTransaccion); 
  router.post('/realizarCompra', controller.realizarCompra);
  router.post("/vender", auth, controller.realizarVenta); // ✅ nueva ruta




  app.use("/api/transacciones", router);
};
