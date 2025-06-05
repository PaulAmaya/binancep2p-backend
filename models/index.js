const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

// Importar modelos
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Usuario = require("./usuario.model")(sequelize, Sequelize);
db.Moneda = require("./moneda.model")(sequelize, Sequelize);
db.Billetera = require("./billetera.model")(sequelize, Sequelize);
db.Anuncio = require("./anuncio.model")(sequelize, Sequelize);
db.Transaccion = require("./transaccion.model")(sequelize, Sequelize);

// RELACIONES

// Usuario ↔ Billetera
db.Usuario.hasMany(db.Billetera, { foreignKey: "usuarioId" });
db.Billetera.belongsTo(db.Usuario, { foreignKey: "usuarioId" });

// Moneda ↔ Billetera
db.Moneda.hasMany(db.Billetera, { foreignKey: "monedaId" });
db.Billetera.belongsTo(db.Moneda, { foreignKey: "monedaId" });

// Usuario ↔ Anuncio
db.Usuario.hasMany(db.Anuncio, { foreignKey: "usuarioId" });
db.Anuncio.belongsTo(db.Usuario, { foreignKey: "usuarioId" });

// Moneda ↔ Anuncio
db.Moneda.hasMany(db.Anuncio, { foreignKey: "monedaId" });
db.Anuncio.belongsTo(db.Moneda, { foreignKey: "monedaId" });

// Usuario ↔ Transacción (comprador y vendedor)
db.Usuario.hasMany(db.Transaccion, { foreignKey: "id_comprador", as: "Comprador" });
db.Usuario.hasMany(db.Transaccion, { foreignKey: "id_vendedor", as: "Vendedor" });
db.Transaccion.belongsTo(db.Usuario, { foreignKey: "id_comprador", as: "Comprador" });
db.Transaccion.belongsTo(db.Usuario, { foreignKey: "id_vendedor", as: "Vendedor" });

// Billetera ↔ Transacción
db.Billetera.hasMany(db.Transaccion, { foreignKey: "id_billetera_origen", as: "Origen" });
db.Billetera.hasMany(db.Transaccion, { foreignKey: "id_billetera_destino", as: "Destino" });
db.Transaccion.belongsTo(db.Billetera, { foreignKey: "id_billetera_origen", as: "Origen" });
db.Transaccion.belongsTo(db.Billetera, { foreignKey: "id_billetera_destino", as: "Destino" });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});




module.exports = db;
