module.exports = app => {
  require("./usuario.routes")(app);
  require("./moneda.routes")(app);
  require("./billetera.routes")(app);
  require("./transaccion.routes")(app);
  require("./anuncio.routes")(app);
};
