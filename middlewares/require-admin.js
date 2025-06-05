function requireAdmin(req, res, next) {
  if (!req.usuario || !req.usuario.es_admin) {
    return res.status(403).json({ mensaje: "Acceso denegado: se requiere rol administrador" });
  }
  next();
}

module.exports = requireAdmin;
