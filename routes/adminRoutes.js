const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/login', adminController.showAdminLoginForm);
router.post('/login', adminController.loginAdmin);
router.get('/logout', adminController.logoutAdmin);
router.get('/', adminController.getAdminDashboard);
router.get('/user-approval', adminController.getUserApproval);
router.post('/approve-user', adminController.approveUser);
router.post('/reject-user', adminController.rejectUser);
router.get('/role-permissions', adminController.getRolePermissions);
router.post('/add-admin', adminController.addAdmin);
router.post('/delete-admin', adminController.deleteAdmin);
router.get('/manuscript', adminController.getManuscript);


module.exports = router;