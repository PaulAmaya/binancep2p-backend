const auth = require("../middlewares/auth.middleware");

module.exports = app => {
  const router = require("express").Router();
  const controller = require("../controllers/usuario.controller.js");

  router.get("/", auth, controller.obtenerUsuarios);     
  router.post("/register", controller.registrar);        
  router.post("/login", controller.login);            

  app.use('/api/usuarios', router);
};
