const db = require("../models");
const Moneda = db.Moneda;

// Crear una nueva moneda
exports.crearMoneda = async (req, res) => {
  const { nombre, valor_en_sus } = req.body;

  if (!nombre || !valor_en_sus) {
    return res.status(400).json({ mensaje: "Nombre y valor_en_sus requeridos" });
  }

  try {
    const moneda = await Moneda.create({ nombre, valor_en_sus });
    res.status(201).json({ mensaje: "Moneda creada", moneda });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear moneda", error });
  }
};

// Obtener todas las monedas
exports.listarMonedas = async (req, res) => {
  try {
    const monedas = await Moneda.findAll();
    res.json(monedas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar monedas", error });
  }
};

// Actualizar moneda
exports.actualizarMoneda = async (req, res) => {
  const { id } = req.params;
  const { nombre, valor_en_sus } = req.body;

  try {
    const moneda = await Moneda.findByPk(id);
    if (!moneda) return res.status(404).json({ mensaje: "Moneda no encontrada" });

    moneda.nombre = nombre;
    moneda.valor_en_sus = valor_en_sus;
    await moneda.save();

    res.json({ mensaje: "Moneda actualizada", moneda });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar moneda", error });
  }
};

// Eliminar moneda
exports.eliminarMoneda = async (req, res) => {
  const { id } = req.params;

  try {
    const moneda = await Moneda.findByPk(id);
    if (!moneda) return res.status(404).json({ mensaje: "Moneda no encontrada" });

    await moneda.destroy();
    res.json({ mensaje: "Moneda eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar moneda", error });
  }
};

exports.obtenerMonedaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const moneda = await Moneda.findByPk(id);
    if (!moneda) return res.status(404).json({ mensaje: "Moneda no encontrada" });

    res.json(moneda);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener moneda", error });
  }
}