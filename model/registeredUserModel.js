const db = require('../config/database');

const findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) return callback(err || new Error("User not found"), null);
        callback(null, results[0]);
    });
};

module.exports = { findUserByEmail };