const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.cart = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent('/cart')}`)

        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');
        const product = await axios.get(base_url + '/product');

        const carts = await axios.get(base_url + '/cart');
        let checkCart = carts.data.find(cart => cart.user_ID == loginSession.UID);

        if (!checkCart) {
            const newCart = await axios.post(base_url + '/cart', { user_ID: loginSession.UID });
            checkCart = newCart.data
        }

        const cartId = checkCart.cart_ID;
        const cartItems = await axios.get(base_url + '/cart-item/' + cartId);
        
        let items = cartItems.data;

        res.render("customer/cart", { 
            loginSession,
            category: category.data, 
            brands: brand.data,
            products: product.data, 
            cartId,
            cartItem: items
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

        if (!loginSession) {
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);
        }

        const carts = await axios.get(base_url + '/cart');
        let checkCart = carts.data.find(cartItem => cartItem.user_ID === loginSession.UID);

        if (!checkCart) {
            const newCart = await axios.post(base_url + '/cart', { user_ID: loginSession.UID });
            checkCart = newCart.data;
        }

        const cartId = checkCart.cart_ID;

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
                location.reload();
            </script>
        `);
    } 
    catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error');
    }
};

exports.deleteItem = async (req, res) => 
{
    try {
        const { id, item } = req.query;

        if (!id || !item)
            return res.status(400).json({ error: 'Missing cartId or productId' });

        const response = await axios.delete(`${base_url}/cart-item`, { params: { id, item } });

        if (response.status === 200) {
            console.log('Item deleted successfully');
            return res.status(200).json({ message: 'Item deleted successfully' });
        }

        res.status(response.status).json({ error: 'Failed to delete item' });

    } 
    catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.checkOut = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        const { cart } = req.query;
        
        await axios.delete(base_url + '/cart/' + cart);

        res.status(200).json({ message: 'Cart cleared' });
    } 
    catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
};
