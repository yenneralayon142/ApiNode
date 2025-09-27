const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Keys = require('./keys');
const User = require('../models/user');

/**
 * Configuración de la estrategia JWT para Passport.
 * Usa tokens Bearer y recupera el usuario asociado si el token es válido.
 */
module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: Keys.secretOrKey
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const userId = jwtPayload.sub || jwtPayload.id;
        if (!userId) {
          return done(null, false);
        }

        const user = await User.findById(userId);
        if (!user) {
          return done(null, false);
        }

        return done(null, User.toPublic(user));
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
