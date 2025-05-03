const express = require('express');

const authController = require('../Controller/authController');
const userController = require('../Controller/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);

router.route('/forgotPassword').post(authController.forgetPassword);
router.route('/verifyOTP').post(authController.verifyOTP);
router.route('/resetPassword').patch(authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.route('/me').get(userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
