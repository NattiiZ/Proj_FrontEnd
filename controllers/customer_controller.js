const axios = require('axios');
const { check } = require('prettier');

const base_url = `http://localhost:${process.env.API_PORT || 3000}`;

exports.cart = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent('/cart')}`)

        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');
        const product = await axios.get(base_url + '/product');
        const cart = await axios.get(base_url + '/cart');

        const cartId = cart.data.find(cart => cart.user_ID == loginSession.UID);
        
        const cartItem = await axios.get(base_url + '/cart-item/' + cartId.cart_ID);

        res.render("customer/cart", { 
            loginSession,
            category: category.data, 
            brands: brand.data,
            products: product.data, 
            cartId: cartId.cart_ID,
            cartItem: cartItem.data
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.getProduct = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const { url, Id } = req.body;

        if (!loginSession) {
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);
        }

        const checkCart = await axios.get(base_url + '/cart');
        let cart = checkCart.data.find(cartItem => cartItem.user_ID === loginSession.UID);

        if (!cart) {
            const newCart = await axios.post(base_url + '/cart', { user_ID: loginSession.UID });
            cart = newCart.data;
        }

        const cartId = cart.cart_ID;

        const cartItems = await axios.get(base_url + '/cart-item');
        const findItem = cartItems.data.find(item => item.cart_ID == cartId && item.product_ID == Id);

        if (!findItem) {
            await axios.post(base_url + '/cart-item', {
                cart_ID: cartId,
                product_ID: Id,
                quantity: 1
            });
        } else
            await axios.put(base_url + '/cart-item/' + findItem.cart_ID, { quantity: findItem.quantity + 1 });

        const product = await axios.get(base_url + '/product/' + Id);
        const brand = await axios.get(base_url + '/brand/' + product.data.brand_ID);

        res.send(`
            <script>
                alert("เพิ่ม ${brand.data.name} ${product.data.name} ลงตะกร้าเรียบร้อยแล้ว");
                window.location.href = "${url}";
            </script>
        `);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
};

