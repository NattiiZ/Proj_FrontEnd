const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.dashboard = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const users = await axios.get(base_url + '/user');
        const user = users.data.find(user => user.user_ID == loginSession.UID)


        res.render('admin/dashboard', { user })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.allCategory = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const category = await axios.get(base_url + '/category');

        res.render('admin/categories', { category: category.data })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.allBrand = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const brand = await axios.get(base_url + '/brand');

        res.render('admin/brands', { brand: brand.data })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.allProduct = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const product = await axios.get(base_url + '/product');

        res.render('admin/products', { product: product.data })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.Customers = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const customers = await axios.get(base_url + '/customer');

        res.render('admin/customers', { customers: customers.data })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.adminEdit = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const users = await axios.get(base_url + '/user');
        const user = users.data.filter(user => user.userType == 1)

        res.render('admin/editUser', { user })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}