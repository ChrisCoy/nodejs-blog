module.exports = {
  eAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.eAdmin) {
      return next();
    }

    req.flash("error_msg", "Voce precisa ser um admin!");
    res.redirect("/");
  },
};
