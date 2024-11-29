const db = require('../config/database');

const findAdminByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ? AND role = "administrator" LIMIT 1';
    db.query(query, [email], (err, results) => {
        if (err || results.length === 0) return callback(err || new Error("Admin not found"), null);
        callback(null, results[0]);
    });
};

module.exports = { findAdminByEmail };