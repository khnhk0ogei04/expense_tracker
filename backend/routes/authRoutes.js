const express = require('express');
const {protect} = require('../middleware/authMiddleware');

const {registerUser, loginUser, getUserInfo, uploadImageForRegister} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); 
router.get("/getUser", protect,  getUserInfo);
router.post("/upload-image", upload.single("image"), uploadImageForRegister);

module.exports = router;
