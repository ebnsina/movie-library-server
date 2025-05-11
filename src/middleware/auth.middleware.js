import passport from "passport";

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */

export async function checkJWT(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    // console.log("check JWT", { err, user, info });

    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized access!" });
    }

    req.user = user;
    next();
  })(req, res, next);
}

/**
 * Middleware to check if the user owns the resource
 * @param {string} userField - Path to the user ID in the resource object
 */

export async function checkOwnership(userField) {
  return (req, res, next) => {
    const resourceUserId = req.resource[userField];
    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden!" });
    }
    next();
  };
}
