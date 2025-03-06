const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.cart = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;

        const product = await axios.get(base_url + '/product');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');

        if (!loginSession)
            return res.redirect('/signin')

        res.render("customer/cart", { 
            products: product.data, 
            category: category.data, 
            brands: brand.data,
            loginSession
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
};


exports.getProduct = async (req, res) =>
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect('/signin')
    } catch (error) {
        
    }
};