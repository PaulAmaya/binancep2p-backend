module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define("usuario", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false
    },
    correo: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    usuario: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    contrasena: {
      type: Sequelize.STRING,
      allowNull: false
    },
    es_admin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: false
  });

  return Usuario;
};
