const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/userControllers');

const router = express.Router();
const {protect} = require('../middleware/authMiddleware');

// Verify that both the middleware and the controller are defined
console.log('Protect middleware:', protect);
console.log('GetAllUsers controller:', getAllUsers);

// router.post('/', registerUser);
router.route("/").post(registerUser).get(protect, getAllUsers);
router.route("/login").post(loginUser); //check it later


module.exports = router;