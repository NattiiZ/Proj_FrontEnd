const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.dashboard = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession || ( loginSession.UID != process.env.ADMIN_ROLE ))
            return res.redirect('back');

        const [users, orders, products, categories] = await Promise.all([
            axios.get(base_url + '/user'),
            axios.get(base_url + '/order'),
            axios.get(base_url + '/product'),
            axios.get(base_url + '/category')
        ]);

        res.render("dashboard", {
            users: users.data, 
            orders: orders.data, 
            products: products.data, 
            category: categories.data 
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};
