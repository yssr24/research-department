const db = require('../config/database');

const createUserWithToken = (email, token, callback) => {
    const query = 'INSERT INTO users (email, approval_status) VALUES (?, "pending")';
    db.query(query, [email], (err, result) => {
        if (err) return callback(err);
        const tokenQuery = 'INSERT INTO user_tokens (user_id, token) VALUES (?, ?)';
        db.query(tokenQuery, [result.insertId, token], callback);
    });
};

const verifyToken = (token, callback) => {
    const query = `
        SELECT users.* 
        FROM users 
        INNER JOIN user_tokens ON users.user_id = user_tokens.user_id 
        WHERE user_tokens.token = ? LIMIT 1
    `;
    db.query(query, [token], (err, results) => {
        if (err || results.length === 0) return callback(err || new Error("Invalid token"), null);
        callback(null, results[0]);
    });
};

const getResearchers = (callback) => {
    const query = 'SELECT first_name, last_name FROM users WHERE role = "researcher" AND approval_status = "approved"';
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

const checkEmailExists = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    db.query(query, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results.length > 0);
    });
};

module.exports = { createUserWithToken, verifyToken, getResearchers, checkEmailExists };