const bcrypt = require('bcrypt');
const User = require('../model/registeredUserModel'); // Ensure correct path
const db = require('../config/database');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const pdf = require('html-pdf');

exports.showLoginForm = (req, res) => {
    res.render('card', { card: 'partials/login', showRegisterButton: true });
};

exports.submitNewPaper = (req, res) => {
    res.render('index', { content: 'partials/researcher/submitNewPaper', user: req.session.user});
};

exports.handleNewPaperSubmission = (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    }

    const { title, abstract, keywords, category } = req.body;
    const file = req.file;
    const researcherId = req.session.user.user_id;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    const convertToPDF = (filePath, callback) => {
        const ext = path.extname(filePath).toLowerCase();
        const pdfPath = filePath.replace(ext, '.pdf');

        if (ext === '.pdf') {
            fs.rename(filePath, pdfPath, callback);
        } else if (ext === '.doc' || ext === '.docx') {
            mammoth.convertToHtml({ path: filePath })
                .then(result => {
                    pdf.create(result.value).toFile(pdfPath, callback);
                })
                .catch(callback);
        } else {
            callback(new Error('Unsupported file type'));
        }
    };

    convertToPDF(file.path, (err) => {
        if (err) {
            console.error('Error converting file to PDF:', err);
            return res.status(500).send('Error converting file to PDF');
        }

        const pdfPath = file.path.replace(path.extname(file.path), '.pdf');
        const query = 'INSERT INTO papers (title, abstract, keywords, category, file_path, researcher_id) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [title, abstract, keywords, category, pdfPath, researcherId], (err, result) => {
            if (err) {
                console.error('Error saving paper:', err);
                return res.status(500).send('Error saving paper');
            }
            res.redirect('/submitNewPaper');
        });
    });
};

exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    User.findUserByEmail(email, (err, user) => {

        if (!user) {
            return res.render('card', { card: 'partials/login', alertMessage: 'Invalid email or password', alertType: 'danger' });
        }
        else if (user.role === 'administrator' || user.role === 'editor') {
            return res.render('card', { card: 'partials/login', alertMessage: 'Invalid email or password', alertType: 'danger' });
        }

        else if (err) {
            return res.render('card', { card: 'partials/login', alertMessage: 'An error occurred. Please try again.', alertType: 'danger' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.render('card', { card: 'partials/login', alertMessage: 'An error occurred. Please try again.', alertType: 'danger' });
            }
            if (isMatch && user.approval_status !== 'approved') {
                return res.render('card', { card: 'partials/login', alertMessage: 'Your account is under review', alertType: 'warning' });
            }
            if (!isMatch) {
                return res.render('card', { card: 'partials/login', alertMessage: 'Wrong password', alertType: 'danger' });
            }

            req.session.user = user;
            res.redirect('/');
        });
    });
};

exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};