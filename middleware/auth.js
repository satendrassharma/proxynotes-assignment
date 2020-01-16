const jwt = require("jsonwebtoken");

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");
  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    console.log({ decoded });
    req.user = decoded;
    next();
  } catch (err) {
    console.error("something wrong with auth middleware");
    return res.status(500).json({ msg: err.message });
  }
};
