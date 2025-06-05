module.exports = (sequelize, Sequelize) => {
  const Moneda = sequelize.define("moneda", {
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    valor_en_sus: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    timestamps: false
  });

  return Moneda;
};
