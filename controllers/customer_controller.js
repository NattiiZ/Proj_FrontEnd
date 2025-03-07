const axios = require('axios');
const { check } = require('prettier');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.cart = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent('/cart')}`)

        const product = await axios.get(base_url + '/product');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');

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
        const { url, Id } = req.body;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);

        const checkCart = await axios.get(base_url + '/cart');
        const userCart = checkCart.data.find(cartItem => cartItem.user_ID === loginSession.UID);

        if (!userCart)
            await axios.post(base_url + '/cart', { user_ID: loginSession.UID });

        const carts = await axios.get(base_url + '/cart');

        const cart = carts.data.find(cart => cart.user_ID === loginSession.UID);
        const cartId = cart.cart_ID;
        console.log("Cart_ID : " + cartId);
        

        const inCart = await axios.get(base_url + '/cart-item/' + cartId);
        const findProduct = inCart.data.find(product => product.product_ID === Id)

        if (!findProduct) {
            console.log("Go!!!");
            
            await axios.post(base_url + '/cart-item', { 
                cart_ID: cartId,
                product_ID: Id,
                quantity: 1
            });
        };
    } 
    catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
};