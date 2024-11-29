const express = require('express');
const router = express.Router();
const registeredUserController = require('../controllers/registeredUserController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });



router.get('/login', registeredUserController.showLoginForm);
router.post('/login', registeredUserController.loginUser);
router.get('/logout', registeredUserController.logoutUser);
router.get('/submitNewPaper', registeredUserController.submitNewPaper);
router.post('/submitNewPaper', upload.single('paperFile'), registeredUserController.handleNewPaperSubmission);

module.exports = router;