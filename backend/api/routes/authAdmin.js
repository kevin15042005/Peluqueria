export const authAdmin = (req, res, next) => {
  const { rol } = req.body;

  if (!rol || !rol !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Acceso denegado.Solo admnistradore" });
  }
  next();
};
