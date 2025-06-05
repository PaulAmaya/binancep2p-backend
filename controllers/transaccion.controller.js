const db = require("../models");
const Transaccion = db.Transaccion;
const Billetera = db.Billetera;
const path = require("path");
const fs = require("fs");

// Crear nueva transacción manual
exports.crearTransaccion = async (req, res) => {
  const {
    tipo,
    vendedorId,
    compradorId,
    billeteraOrigenId,
    billeteraDestinoId,
    billeteraVendedorId,
    monto,
    comprobante_pago
  } = req.body;

  if (!tipo || !billeteraOrigenId || !billeteraDestinoId || !monto) {
    return res.status(400).json({ mensaje: "Faltan datos requeridos" });
  }

  try {
    const nueva = await Transaccion.create({
      tipo,
      vendedorId,
      compradorId,
      billeteraOrigenId,
      billeteraDestinoId,
      id_billetera_vendedor: billeteraVendedorId,
      monto,
      comprobante_pago,
      estado: "pendiente"
    });

    res.status(201).json({ mensaje: "Transacción creada", transaccion: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear transacción", error });
  }
};

// Actualizar estado de la transacción
exports.actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!["finalizada", "cancelada"].includes(estado)) {
    return res.status(400).json({ mensaje: "Estado inválido" });
  }

  try {
    const transaccion = await Transaccion.findByPk(id);
    if (!transaccion) return res.status(404).json({ mensaje: "No encontrada" });

    transaccion.estado = estado;
    await transaccion.save();

    res.json({ mensaje: "Estado actualizado", transaccion });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar estado", error });
  }
};

// Obtener transacciones por billetera
exports.verPorBilletera = async (req, res) => {
  const { id } = req.params;

  try {
    const movimientos = await Transaccion.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { id_billetera_origen: id },
          { id_billetera_destino: id },
          { id_billetera_vendedor: id }
        ]
      },
      include: [
        {
          model: db.Usuario,
          as: "comprador",
          attributes: ["id", "nombre"]
        },
        {
          model: db.Usuario,
          as: "vendedor",
          attributes: ["id", "nombre"]
        },
        {
          model: db.Billetera,
          as: "billeteraOrigen",
          include: [{ model: db.Moneda, as: "moneda", attributes: ["id", "nombre"] }]
        },
        {
          model: db.Billetera,
          as: "billeteraDestino",
          include: [{ model: db.Moneda, as: "moneda", attributes: ["id", "nombre"] }]
        },
        {
          model: db.Billetera,
          as: "billeteraVendedor",
          include: [{ model: db.Moneda, as: "moneda", attributes: ["id", "nombre"] }]
        }
      ],
      order: [["fecha", "DESC"]]
    });

    res.json(movimientos);
  } catch (error) {
    console.error("Error al obtener transacciones por billetera:", error);
    res.status(500).json({ mensaje: "Error al obtener transacciones", error });
  }
};

// Realizar compra automática desde un anuncio
exports.realizarCompra = async (req, res) => {
  const { anuncioId, billeteraOrigenId, cantidad } = req.body;
  const compradorId = req.usuario.id;
  const comprobante = req.files ? req.files.comprobante : null;

  if (!anuncioId || !billeteraOrigenId || !cantidad) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const anuncio = await db.Anuncio.findByPk(anuncioId, {
      include: [db.Usuario, db.Moneda]
    });

    if (!anuncio || anuncio.estado !== "activo") {
      return res.status(404).json({ mensaje: "Anuncio no válido o finalizado" });
    }

    const vendedorId = anuncio.usuarioId;
    const monedaDestino = anuncio.moneda;
    const precioUnitario = anuncio.precio_ofrecido;

    const compradorBilletera = await db.Billetera.findOne({
      where: { id: billeteraOrigenId, usuarioId: compradorId },
      include: [db.Moneda]
    });

    if (!compradorBilletera) {
      return res.status(404).json({ mensaje: "Billetera de origen no encontrada" });
    }

    const totalUSD = cantidad * precioUnitario;
    const valorUSDOrigen = compradorBilletera.moneda.valor_en_sus;
    const cantidadEnMonedaOrigen = totalUSD / valorUSDOrigen;

    if (compradorBilletera.saldo < cantidadEnMonedaOrigen) {
      return res.status(400).json({ mensaje: "Saldo insuficiente" });
    }

    let billeteraVendedor = await db.Billetera.findOne({
      where: {
        usuarioId: vendedorId,
        monedaId: monedaDestino.id
      }
    });

    if (!billeteraVendedor || Number(billeteraVendedor.saldo) < Number(cantidad)) {
      return res.status(400).json({ mensaje: "Vendedor no tiene saldo suficiente" });
    }

    let billeteraDestinoComprador = await db.Billetera.findOne({
      where: {
        usuarioId: compradorId,
        monedaId: monedaDestino.id
      }
    });

    if (!billeteraDestinoComprador) {
      billeteraDestinoComprador = await db.Billetera.create({
        usuarioId: compradorId,
        monedaId: monedaDestino.id,
        saldo: 0
      });
    }

    let billeteraVendedorOrigen = await db.Billetera.findOne({
      where: {
        usuarioId: vendedorId,
        monedaId: compradorBilletera.moneda.id
      }
    });

    if (!billeteraVendedorOrigen) {
      billeteraVendedorOrigen = await db.Billetera.create({
        usuarioId: vendedorId,
        monedaId: compradorBilletera.moneda.id,
        saldo: 0
      });
    }

    // Actualizar saldos
    compradorBilletera.saldo -= Number(cantidadEnMonedaOrigen);
    billeteraVendedor.saldo -= Number(cantidad);
    billeteraDestinoComprador.saldo += Number(cantidad);
    billeteraVendedorOrigen.saldo += Number(cantidadEnMonedaOrigen);

    await compradorBilletera.save();
    await billeteraVendedor.save();
    await billeteraDestinoComprador.save();
    await billeteraVendedorOrigen.save();

    anuncio.cantidad_disponible -= cantidad;
    if (anuncio.cantidad_disponible <= 0) anuncio.estado = "finalizado";
    await anuncio.save();

    const transaccion = await db.Transaccion.create({
      tipo: "compra",
      monto: cantidad,
      comprobante_pago: null,
      estado: "pendiente",
      id_comprador: compradorId,
      id_vendedor: vendedorId,
      id_billetera_origen: compradorBilletera.id,
      id_billetera_destino: billeteraDestinoComprador.id,
      id_billetera_vendedor: billeteraVendedor.id
    });

    if (comprobante) {
      const dir = path.join(__dirname, "../public/comprobantes");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${transaccion.id}.jpg`;
      const filepath = path.join(dir, filename);
      await comprobante.mv(filepath);
      const comprobantePath = `/comprobantes/${filename}`;

      transaccion.comprobante_pago = comprobantePath;
      await transaccion.save();
    }

    res.json({
      mensaje: "Compra completada con éxito",
      transaccion,
      pagado: cantidadEnMonedaOrigen.toFixed(6),
      recibido: cantidad,
      monedaOrigen: compradorBilletera.moneda.nombre,
      monedaDestino: monedaDestino.nombre
    });

  } catch (error) {
    console.error("Error en transacción:", error);
    res.status(500).json({ mensaje: "Error al procesar transacción", error });
  }
};


 exports.responderTransaccion = async (req, res) => {
  const { id } = req.params;
  const { respuesta } = req.body; // 'aceptar' o 'rechazar'
  const vendedorId = req.usuario.id; // desde el token

  try {
    const transaccion = await db.Transaccion.findByPk(id);
    if (!transaccion || transaccion.estado !== 'pendiente') {
      return res.status(400).json({ mensaje: "Transacción no válida o ya procesada" });
    }

    if (transaccion.id_vendedor !== vendedorId) {
      return res.status(403).json({ mensaje: "No autorizado para responder esta transacción" });
    }

    const billeteraOrigen = await db.Billetera.findByPk(transaccion.id_billetera_origen);
    const billeteraDestino = await db.Billetera.findByPk(transaccion.id_billetera_destino);
    const billeteraVendedor = await db.Billetera.findByPk(transaccion.id_billetera_vendedor);

    if (respuesta === 'aceptar') {
      transaccion.estado = 'finalizada';
    } else if (respuesta === 'rechazar') {
      billeteraOrigen.saldo += Number(transaccion.monto * transaccion.precio_en_dolares || 0);
      billeteraDestino.saldo -= Number(transaccion.monto);
      billeteraVendedor.saldo -= Number(transaccion.monto * transaccion.precio_en_dolares || 0);

      await billeteraOrigen.save();
      await billeteraDestino.save();
      await billeteraVendedor.save();

      transaccion.estado = 'cancelada';
    } else {
      return res.status(400).json({ mensaje: "Respuesta inválida" });
    }

    await transaccion.save();
    res.json({ mensaje: "Transacción actualizada", transaccion });

  } catch (error) {
    console.error("Error al responder transacción:", error);
    res.status(500).json({ mensaje: "Error interno", error });
  }
};


exports.realizarVenta = async (req, res) => {
  const { anuncioId, billeteraOrigenId, cantidad } = req.body;
  const vendedorId = req.usuario.id;
  const comprobante = req.files ? req.files.comprobante : null;

  if (!anuncioId || !billeteraOrigenId || !cantidad) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const anuncio = await db.Anuncio.findByPk(anuncioId, {
      include: [db.Usuario, db.Moneda]
    });

    if (!anuncio || anuncio.estado !== "activo") {
      return res.status(404).json({ mensaje: "Anuncio no válido o finalizado" });
    }

    const compradorId = anuncio.usuarioId;
    const monedaDestino = anuncio.moneda; // moneda que el comprador desea adquirir
    const precioUnitario = anuncio.precio_ofrecido;

    const vendedorBilletera = await db.Billetera.findOne({
      where: { id: billeteraOrigenId, usuarioId: vendedorId },
      include: [db.Moneda]
    });

    if (!vendedorBilletera) {
      return res.status(404).json({ mensaje: "Billetera de origen no encontrada" });
    }

    if (vendedorBilletera.moneda.id !== monedaDestino.id) {
      return res.status(400).json({ mensaje: "La billetera no corresponde a la moneda del anuncio" });
    }

    if (vendedorBilletera.saldo < cantidad) {
      return res.status(400).json({ mensaje: "Saldo insuficiente" });
    }

    const totalUSD = cantidad * precioUnitario;
    const monedaComprador = await db.Moneda.findByPk(anuncio.monedaId); // misma monedaDestino
    const billeteraComprador = await db.Billetera.findOne({
      where: {
        usuarioId: compradorId,
        monedaId: monedaDestino.id
      }
    });

    if (!billeteraComprador) {
      return res.status(404).json({ mensaje: "Comprador no tiene billetera para esta moneda" });
    }

    // Crear billetera destino para el vendedor (moneda del comprador)
    let billeteraVendedorDestino = await db.Billetera.findOne({
      where: {
        usuarioId: vendedorId,
        monedaId: anuncio.monedaId
      }
    });

    if (!billeteraVendedorDestino) {
      billeteraVendedorDestino = await db.Billetera.create({
        usuarioId: vendedorId,
        monedaId: anuncio.monedaId,
        saldo: 0
      });
    }

    // Actualizar saldos
    vendedorBilletera.saldo -= Number(cantidad);
    billeteraComprador.saldo += Number(cantidad);

    const valorUSDMonedaVendedor = vendedorBilletera.moneda.valor_en_sus;
    const cantidadEnMonedaVendedor = totalUSD / valorUSDMonedaVendedor;

    billeteraVendedorDestino.saldo += Number(cantidadEnMonedaVendedor);

    await vendedorBilletera.save();
    await billeteraComprador.save();
    await billeteraVendedorDestino.save();

    anuncio.cantidad_disponible -= cantidad;
    if (anuncio.cantidad_disponible <= 0) anuncio.estado = "finalizado";
    await anuncio.save();

    const transaccion = await db.Transaccion.create({
      tipo: "venta",
      monto: cantidad,
      comprobante_pago: null,
      estado: "pendiente",
      id_comprador: compradorId,
      id_vendedor: vendedorId,
      id_billetera_origen: vendedorBilletera.id,
      id_billetera_destino: billeteraComprador.id,
      id_billetera_vendedor: billeteraVendedorDestino.id
    });

    if (comprobante) {
      const dir = path.join(__dirname, "../public/comprobantes");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${transaccion.id}.jpg`;
      const filepath = path.join(dir, filename);
      await comprobante.mv(filepath);
      const comprobantePath = `/comprobantes/${filename}`;

      transaccion.comprobante_pago = comprobantePath;
      await transaccion.save();
    }

    res.json({
      mensaje: "Venta completada con éxito",
      transaccion,
      pagado: cantidad,
      recibido: cantidadEnMonedaVendedor.toFixed(6),
      monedaOrigen: vendedorBilletera.moneda.nombre,
      monedaDestino: monedaDestino.nombre
    });

  } catch (error) {
    console.error("Error en transacción:", error);
    res.status(500).json({ mensaje: "Error al procesar transacción", error });
  }
};
