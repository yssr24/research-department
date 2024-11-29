const crypto = require('crypto');
const bcrypt = require('bcrypt');
const transporter = require('../config/emailConfig');
const User = require('../model/userModel');
const db = require('../config/database');

exports.getUserHomePage = (req, res) => {
    res.render('index', { content: 'partials/user/home', user: req.session.user });
};

exports.getUserViewResearch = (req, res) => {
    res.render('index', { content: 'partials/user/viewresearch', user: req.session.user });
};

exports.getUserReseachersProfile = (req, res) => {
    User.getResearchers((err, researchers) => {
        if (err) return res.send("Error fetching researchers");
        res.render('index', { content: 'partials/user/researcherprofiles', user: req.session.user, researchers });
    });
};

exports.showEmailForm = (req, res) => {
    res.render('card', { card: 'partials/signup/signupEmail' });
};

exports.sendVerificationEmail = (req, res) => {
    const email = req.body.email;
    const token = crypto.randomBytes(20).toString('hex');

    User.checkEmailExists(email, (err, exists) => {
        if (err) return res.send("Error checking email");
        if (exists) {
            return res.render('card', { card: 'partials/signup/signupEmail', alertMessage: 'Email is already taken', alertType: 'danger' });
        }

        User.createUserWithToken(email, token, (err) => {
            if (err) return res.send("Error creating user");

            const link = `http://localhost:3000/verify/${token}`;
            const mailOptions = {
                to: email,
                subject: "Verify your email",
                text: `Click this link to complete your registration: ${link}`
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) return res.send("Error sending email");
                res.render('card', { card: 'partials/signup/signupEmail', alertMessage: 'Verification email sent!', alertType: 'success' });
            });
        });
    });
};

exports.verifyTokenAndShowForm = (req, res) => {
    const token = req.params.token;

    User.verifyToken(token, (err, user) => {
        if (err || !user) return res.send("Invalid or expired token");
        res.render('card', { card: 'partials/signup/completeRegistration', token });
    });
};

exports.completeRegistration = (req, res) => {
    const { token, first_name, last_name, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send("Error hashing password");

        db.query('SELECT user_id FROM user_tokens WHERE token = ?', [token], (err, result) => {
            if (err || !result.length) return res.send("Invalid token");

            const userId = result[0].user_id;
            const updateUserQuery = 'UPDATE users SET first_name = ?, last_name = ?, password = ?, role = ?, approval_status = "pending" WHERE user_id = ?';
            db.query(updateUserQuery, [first_name, last_name, hashedPassword, role, userId], (err) => {
                if (err) return res.send("Error completing registration");
                res.redirect('/login');
            });
        });
    });
};