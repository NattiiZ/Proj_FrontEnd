const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/user_controller');
const customer_controller = require('../controllers/customer_controller');
const account_controller = require('../controllers/account_controller');
const register_controller = require('../controllers/register_controller');
const auth_controller = require('../controllers/auth_controller');
const admin_controller = require('../controllers/admin_controller');




router.get('/', user_controller.home);
router.get('/search', user_controller.search);
router.get('/detail/', user_controller.productDetail);
router.get('/category', user_controller.categoryList);
router.get('/category/:id', user_controller.categorySelected);

router.get('/cart', customer_controller.cart);
router.post('/getProduct', customer_controller.getProduct);
router.post('/deleteItem', customer_controller.deleteItem);

router.get('/account', account_controller.accountMenu);

router.get('/signin', auth_controller.signin);
router.post('/checkLogin', auth_controller.checkLogin);
router.post('/logout', auth_controller.logout);

router.get('/signup', register_controller.signup);
router.post('/checkReg', register_controller.checkReg);
router.get('/regForm', register_controller.regForm);
router.post('/createUser', register_controller.createUser);

router.get('/admin-dashboard', admin_controller.dashboard);




module.exports = router;