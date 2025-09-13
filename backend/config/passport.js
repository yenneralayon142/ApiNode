const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Keys = require('./keys');
const User = require('../models/user');

/**
 * Configuración de la estrategia JWT para Passport
 */
module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: Keys.secretOrKey
  };

  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id, (err, user) => {
        if (err) {
          return done(err, false);
        }

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
