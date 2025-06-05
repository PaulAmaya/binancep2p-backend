module.exports = (sequelize, Sequelize) => {
  const Billetera = sequelize.define("billetera", {
    saldo: {
      type: Sequelize.DECIMAL(30, 8),
      defaultValue: 0
    }
  }, {
    timestamps: false
  });

  return Billetera;
};
