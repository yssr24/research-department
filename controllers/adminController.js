const bcrypt = require('bcrypt');
const Admin = require('../model/adminModel');
const db = require('../config/database');
const transporter = require('../config/emailConfig');

exports.showAdminLoginForm = (req, res) => {
    res.render('card', { card: 'partials/login', showRegisterButton: false });
};

exports.loginAdmin = (req, res) => {
    const { email, password } = req.body;

    Admin.findAdminByEmail(email, (err, admin) => {
        if (err || !admin || admin.role === 'researcher' || admin.role === 'editor') {
            return res.render('card', { card: 'partials/login', alertMessage: 'Invalid email or password', alertType: 'danger' });
        }

        if (admin.approval_status !== 'approved') {
            return res.render('card', { card: 'partials/login', alertMessage: 'User not approved', alertType: 'warning' });
        }

        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.render('card', { card: 'partials/login', alertMessage: 'Invalid email or password', alertType: 'danger' });
            }

            req.session.admin = admin;
            res.redirect('/admin');
        });
    });
};

exports.logoutAdmin = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
};

exports.getAdminDashboard = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const queries = {
        totalUsers: 'SELECT COUNT(*) AS count FROM users WHERE role != "administrator"',
        approvedUsers: 'SELECT COUNT(*) AS count FROM users WHERE approval_status = "approved"',
        approvedResearchers: 'SELECT COUNT(*) AS count FROM users WHERE role = "researcher" AND approval_status = "approved"',
        approvedEditors: 'SELECT COUNT(*) AS count FROM users WHERE role = "editor" AND approval_status = "approved"',
        pendingResearchers: 'SELECT COUNT(*) AS count FROM users WHERE role = "researcher" AND approval_status = "pending"',
        pendingEditors: 'SELECT COUNT(*) AS count FROM users WHERE role = "editor" AND approval_status = "pending"'
    };

    const executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results[0].count);
            });
        });
    };

    Promise.all([
        executeQuery(queries.totalUsers),
        executeQuery(queries.approvedUsers),
        executeQuery(queries.approvedResearchers),
        executeQuery(queries.approvedEditors),
        executeQuery(queries.pendingResearchers),
        executeQuery(queries.pendingEditors)
    ]).then(([totalUsers, approvedUsers, approvedResearchers, approvedEditors, pendingResearchers, pendingEditors]) => {
        res.render('admin', {
            content: 'partials/admin/dashboard',
            stats: {
                totalUsers,
                approvedUsers,
                approvedResearchers,
                approvedEditors,
                pendingResearchers,
                pendingEditors
            }
        });
    }).catch(err => {
        console.error('Error fetching dashboard data:', err);
        res.status(500).send('Error fetching dashboard data');
    });
};
exports.getUserApproval = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const query = 'SELECT * FROM users WHERE approval_status = "pending"';
    db.query(query, (err, results) => {
        if (err) {
            return res.send("Error fetching pending users");
        }

        // Format the created_at date
        results.forEach(user => {
            user.formattedDate = new Date(user.created_at).toLocaleDateString('en-US');
        });

        res.render('admin', { content: 'partials/admin/userApproval', users: results });
    });
};

exports.approveUser = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const userId = req.body.userId;
    const query = 'SELECT email FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.send("Error fetching user email");
        }

        const email = results[0].email;

        const updateQuery = 'UPDATE users SET approval_status = "approved" WHERE user_id = ?';
        db.query(updateQuery, [userId], (err) => {
            if (err) {
                return res.send("Error approving user");
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Account Approval Notification',
                text: 'Your account registration has been approved. You can now log in and access the portal.',
                html: '<p>Your account registration has been <strong>approved</strong>. You can now log in and access the portal.</p>'
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return res.send("Error sending approval email");
                }
                res.redirect('/admin/user-approval');
            });
        });
    });
};

exports.rejectUser = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const userId = req.body.userId;
    const query = 'SELECT email FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.send("Error fetching user email");
        }

        const email = results[0].email;

        const deleteQuery = 'DELETE FROM users WHERE user_id = ?';
        db.query(deleteQuery, [userId], (err) => {
            if (err) {
                return res.send("Error deleting user");
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Account Rejection Notification',
                text: 'Your account registration has been rejected.',
                html: '<p>Your account registration has been <strong>rejected</strong>.</p>'
            };

            transporter.sendMail(mailOptions, (error) => {
                if (error) {
                    return res.send("Error sending rejection email");
                }
                res.redirect('/admin/user-approval');
            });
        });
    });
};

exports.getRolePermissions = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const adminQuery = 'SELECT * FROM users WHERE role = "administrator"';
    db.query(adminQuery, (err, admins) => {
        if (err) {
            return res.send("Error fetching administrators");
        }

        const userQuery = 'SELECT * FROM users WHERE role IN ("researcher", "editor") AND approval_status = "approved"';
        db.query(userQuery, (err, users) => {
            if (err) {
                return res.send("Error fetching users");
            }

            res.render('admin', { content: 'partials/admin/role', admins, users });
        });
    });
};

exports.addAdmin = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const { first_name, last_name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (first_name, last_name, email, password, role, approval_status) VALUES (?, ?, ?, ?, "administrator", "approved")';
    db.query(query, [first_name, last_name, email, hashedPassword], (err, result) => {
        if (err) {
            return res.send("Error adding administrator");
        }
        res.redirect('/admin/role-permissions');
    });
};

exports.deleteAdmin = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const userId = req.body.userId;
    const query = 'DELETE FROM users WHERE user_id = ? AND role = "administrator"';
    db.query(query, [userId], (err, result) => {
        if (err) {
            return res.send("Error deleting administrator");
        }
        res.redirect('/admin/role-permissions');
    });
};

exports.addUser = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const { first_name, last_name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (first_name, last_name, email, password, role, approval_status) VALUES (?, ?, ?, ?, ?, "approved")';
    db.query(query, [first_name, last_name, email, hashedPassword, role], (err, result) => {
        if (err) {
            return res.send("Error adding user");
        }
        res.redirect('/admin/role-permissions');
    });
};

exports.updateUserRole = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const { userId, role } = req.body;
    const query = 'UPDATE users SET role = ? WHERE user_id = ?';
    db.query(query, [role, userId], (err, result) => {
        if (err) {
            return res.send("Error updating user role");
        }
        res.redirect('/admin/role-permissions');
    });
};

exports.deleteUser = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const userId = req.body.userId;
    const query = 'DELETE FROM users WHERE user_id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            return res.send("Error deleting user");
        }
        res.redirect('/admin/role-permissions');
    });
};

exports.getManuscript = (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    const query = `
        SELECT papers.*, users.first_name, users.last_name 
        FROM papers 
        JOIN users ON papers.researcher_id = users.user_id
        WHERE papers.status = 'submitted'
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching manuscripts:', err);
            return res.status(500).send('Error fetching manuscripts');
        }

        res.render('admin', {
            content: 'partials/admin/manuscript',
            papers: results
        });
    });
};