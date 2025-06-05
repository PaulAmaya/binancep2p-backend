module.exports = (sequelize, Sequelize) => {
  const Anuncio = sequelize.define("anuncio", {
    tipo: {
      type: Sequelize.ENUM("compra", "venta"),
      allowNull: false
    },
    precio_ofrecido: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    cantidad_disponible: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    },
    descripcion_pago: {
      type: Sequelize.TEXT
    },
    imagen_pago: {
      type: Sequelize.STRING
    },
    estado: {
      type: Sequelize.ENUM("activo", "finalizado"),
      defaultValue: "activo"
    }
  }, {
    timestamps: false
  });

  return Anuncio;
};
