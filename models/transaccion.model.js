module.exports = (sequelize, Sequelize) => {
  const Transaccion = sequelize.define("transacciones", {
    tipo: {
      type: Sequelize.ENUM("compra", "venta", "transferencia"),
      allowNull: false
    },
    monto: {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false
    },
    comprobante_pago: {
      type: Sequelize.TEXT
    },
    estado: {
      type: Sequelize.ENUM("pendiente", "finalizada", "cancelada"),
      defaultValue: "pendiente"
    },
    fecha: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    id_comprador: {
      type: Sequelize.INTEGER
    },
    id_vendedor: {
      type: Sequelize.INTEGER
    },
    id_billetera_origen: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    id_billetera_destino: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    id_billetera_vendedor: {
      type: Sequelize.INTEGER,
      allowNull: false // o false si es obligatorio
    }
  }, {
    timestamps: false
  });

  // Asignación de asociaciones
  Transaccion.associate = (models) => {
    Transaccion.belongsTo(models.Usuario, {
      as: "comprador",
      foreignKey: "id_comprador"
    });

    Transaccion.belongsTo(models.Usuario, {
      as: "vendedor",
      foreignKey: "id_vendedor"
    });

    Transaccion.belongsTo(models.Billetera, {
      as: "billeteraOrigen",
      foreignKey: "id_billetera_origen"
    });

    Transaccion.belongsTo(models.Billetera, {
      as: "billeteraDestino",
      foreignKey: "id_billetera_destino"
    });
    
    Transaccion.belongsTo(models.Billetera, {
      as: "billeteraVendedor",
      foreignKey: "id_billetera_vendedor"
    });

  };

  return Transaccion;
};
