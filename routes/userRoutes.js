const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/', userController.getUserHomePage);
router.get('/view-research', userController.getUserViewResearch);
router.get('/reseacher-profiles', userController.getUserReseachersProfile);

router.get('/signup', userController.showEmailForm);
router.post('/signup', userController.sendVerificationEmail);
router.get('/verify/:token', userController.verifyTokenAndShowForm);
router.post('/signup/complete-registration', userController.completeRegistration);

module.exports = router;