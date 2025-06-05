const db = require("../models");
const jwt = require("jsonwebtoken");

// Cargar modelo
const Usuario = db.Usuario;

// Registro
exports.registrar = async (req, res) => {
  const { nombre, correo, usuario, contrasena } = req.body;

  if (!nombre || !correo || !usuario || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos requeridos" });
  }

  try {
    // Verificar si ya existe el usuario
    const existente = await Usuario.findOne({ where: { usuario } });
    if (existente) {
      return res.status(409).json({ mensaje: "El usuario ya existe" });
    }

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      usuario,
      contrasena
    });

    res.status(201).json({ mensaje: "Usuario registrado", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Login
exports.login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ mensaje: "Usuario y contraseña requeridos" });
  }

  try {
    const usuarioEncontrado = await Usuario.findOne({ where: { usuario, contrasena } });

    if (!usuarioEncontrado) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuarioEncontrado.id, usuario: usuarioEncontrado.usuario, es_admin: usuarioEncontrado.es_admin },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ mensaje: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

// Obtener listado de usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nombre", "correo", "usuario", "es_admin"]
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
};
