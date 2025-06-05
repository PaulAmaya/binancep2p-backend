const db = require("../models");
const Billetera = db.Billetera;
const Moneda = db.Moneda;
const Usuario = db.Usuario;

// Crear una nueva billetera (solo si no existe)
exports.crearBilletera = async (req, res) => {
  const { monedaId } = req.body;
  const usuarioId = req.usuario.id;

  if (!monedaId) {
    return res.status(400).json({ mensaje: "monedaId es obligatorio" });
  }

  try {
    // Verificar si ya existe
    const existe = await db.Billetera.findOne({
      where: { usuarioId, monedaId }
    });

    if (existe) {
      return res.status(409).json({ mensaje: "Ya tienes una billetera para esta moneda" });
    }

    const nueva = await db.Billetera.create({
      usuarioId,
      monedaId,
      saldo: 0
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error("Error al crear billetera:", error);
    res.status(500).json({ mensaje: "Error interno", error });
  }
};


// Obtener todas las billeteras del usuario
exports.obtenerBilleteras = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const billeteras = await Billetera.findAll({
      where: { usuarioId },
      include: [{ model: Moneda, attributes: ["nombre", "valor_en_sus"] }]
    });
    res.json(billeteras);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar billeteras", error });
  }
};

// Actualizar saldo manualmente (sólo para pruebas/admin)
exports.actualizarSaldo = async (req, res) => {
  const { id } = req.params;
  const { saldo } = req.body;

  try {
    const billetera = await Billetera.findByPk(id);
    if (!billetera) return res.status(404).json({ mensaje: "Billetera no encontrada" });

    billetera.saldo = saldo;
    await billetera.save();

    res.json({ mensaje: "Saldo actualizado", billetera });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar saldo", error });
  }
};

// Eliminar billetera
exports.eliminarBilletera = async (req, res) => {
  const { id } = req.params;

  try {
    const billetera = await Billetera.findByPk(id);
    if (!billetera) return res.status(404).json({ mensaje: "Billetera no encontrada" });

    await billetera.destroy();
    res.json({ mensaje: "Billetera eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar billetera", error });
  }
};
