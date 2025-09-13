const db = require('../config/config');
const bcrypt = require('bcryptjs');

const User = {};

/**
 * Listar todos los usuarios
 */
User.findAll = (result) => {
  const sql = `
    SELECT id, email, name, lastname, phone, image, created_at, updated_at
    FROM users
  `;

  db.query(sql, (err, users) => {
    if (err) {
      console.error('Error al listar usuarios:', err);
      return result(err, null);
    }

    console.log('Usuarios encontrados:', users.length);
    return result(null, users);
  });
};

/**
 * Buscar usuario por ID
 */
User.findById = (id, result) => {
  const sql = `
    SELECT id, email, name, lastname, image, password
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) {
      console.error('Error al consultar por ID:', err);
      return result(err, null);
    }

    const user = rows && rows[0] ? rows[0] : null;
    console.log('Usuario consultado:', user);
    return result(null, user);
  });
};

/**
 * Buscar usuario por email
 */
User.findByEmail = (email, result) => {
  const sql = `
    SELECT id, email, name, lastname, image, phone, password
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [email], (err, rows) => {
    if (err) {
      console.error('Error al consultar por email:', err);
      return result(err, null);
    }

    const user = rows && rows[0] ? rows[0] : null;
    console.log('Usuario consultado:', user);
    return result(null, user);
  });
};

/**
 * Crear usuario
 */
User.create = async (user, result) => {
  try {
    const hash = await bcrypt.hash(user.password, 10);

    const sql = `
      INSERT INTO users (
        email,
        name,
        lastname,
        phone,
        image,
        password,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user.email,
      user.name,
      user.lastname,
      user.phone,
      user.image,
      hash,
      new Date(),
      new Date()
    ];

    db.query(sql, params, (err, res) => {
      if (err) {
        console.error('Error al crear al usuario:', err);
        return result(err, null);
      }

      const created = { id: res.insertId, ...user, password: undefined };
      console.log('Usuario creado:', created);
      return result(null, created);
    });
  } catch (err) {
    console.error('Error al hashear contraseña:', err);
    return result(err, null);
  }
};

/**
 * Actualizar usuario (campos dinámicos)
 */
User.update = async (user, result) => {
  try {
    const fields = [];
    const values = [];

    // Contraseña (si viene, se hashea)
    if (user.password) {
      const hash = await bcrypt.hash(user.password, 10);
      fields.push('password = ?');
      values.push(hash);
    }

    if (user.email) {
      fields.push('email = ?');
      values.push(user.email);
    }
    if (user.name) {
      fields.push('name = ?');
      values.push(user.name);
    }
    if (user.lastname) {
      fields.push('lastname = ?');
      values.push(user.lastname);
    }
    if (user.phone) {
      fields.push('phone = ?');
      values.push(user.phone);
    }
    if (user.image) {
      fields.push('image = ?');
      values.push(user.image);
    }

    // Siempre actualizamos la fecha
    fields.push('updated_at = ?');
    values.push(new Date());

    if (fields.length === 0) {
      // No hay nada que actualizar
      return result(null, { id: user.id });
    }

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(user.id);

    db.query(sql, values, (err) => {
      if (err) {
        console.error('Error al actualizar usuario:', err);
        return result(err, null);
      }

      const updated = { id: user.id, ...user, password: undefined };
      console.log('Usuario actualizado:', updated);
      return result(null, updated);
    });
  } catch (err) {
    console.error('Error en update:', err);
    return result(err, null);
  }
};

/**
 * Eliminar usuario
 */
User.delete = (id, result) => {
  const sql = 'DELETE FROM users WHERE id = ?';

  db.query(sql, [id], (err, res) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return result(err, null);
    }

    console.log('Usuario eliminado con id:', id, 'Afectados:', res.affectedRows);
    return result(null, res);
  });
};

module.exports = User;
