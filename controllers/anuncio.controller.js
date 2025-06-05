const db = require("../models");
const Anuncio = db.Anuncio;
const Moneda = db.Moneda;
const Usuario = db.Usuario;

// Crear anuncio (compra o venta)
exports.crearAnuncio = async (req, res) => {
  const {
    tipo,
    monedaId,
    precio_ofrecido,
    cantidad_disponible,
    descripcion_pago,
    imagen_pago
  } = req.body;
  const usuarioId = req.usuario.id;

  if (!tipo || !monedaId || !precio_ofrecido || !cantidad_disponible) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const anuncio = await Anuncio.create({
      usuarioId,
      tipo,
      monedaId,
      precio_ofrecido,
      cantidad_disponible,
      descripcion_pago,
      imagen_pago,
      estado: "activo"
    });

    res.status(201).json({ mensaje: "Anuncio creado con éxito", anuncio });
  } catch (error) {
    console.error("Error al crear anuncio:", error);
    res.status(500).json({ mensaje: "Error interno al crear el anuncio", error });
  }
};

// Listar anuncios activos por tipo y moneda
exports.listarAnuncios = async (req, res) => {
  const { tipo, monedaId } = req.query;

  try {
    const anuncios = await Anuncio.findAll({
      where: {
        estado: "activo",
        ...(tipo && { tipo }),
        ...(monedaId && { monedaId })
      },
      include: [
        {
          model: Usuario,
          attributes: ["id", "usuario"]
        },
        {
          model: Moneda,
          attributes: ["id", "nombre", "valor_en_sus"]
        }
      ],
    });

    res.json(anuncios);
  } catch (error) {
    console.error("Error al listar anuncios:", error);
    res.status(500).json({ mensaje: "Error interno al listar anuncios", error });
  }
};

// Finalizar anuncio
exports.finalizarAnuncio = async (req, res) => {
  const { id } = req.params;

  try {
    const anuncio = await Anuncio.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }

    anuncio.estado = "finalizado";
    await anuncio.save();

    res.json({ mensaje: "Anuncio finalizado con éxito" });
  } catch (error) {
    console.error("Error al finalizar anuncio:", error);
    res.status(500).json({ mensaje: "Error interno al finalizar anuncio", error });
  }
};


exports.obtenerAnuncioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const anuncio = await Anuncio.findByPk(id, {
      include: [
        {
          model: Usuario,
          attributes: ["id", "usuario"]
        },
        {
          model: Moneda,
          attributes: ["id", "nombre", "valor_en_sus"]
        }
      ]
    });

    if (!anuncio) {
      return res.status(404).json({ mensaje: "Anuncio no encontrado" });
    }

    res.json(anuncio);
  } catch (error) {
    console.error("Error al obtener anuncio:", error);
    res.status(500).json({ mensaje: "Error interno al obtener anuncio", error });
  }
}