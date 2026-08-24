const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      next();
    } catch (err) {
      res.status(400).json({ error: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;
