const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.accountMenu = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const [category, userInfo, customers] = await Promise.all([
            axios.get(base_url + '/category'),
            axios.get(base_url + '/user/' + loginSession.UID),
            axios.get(base_url + '/customer')
        ]);

        const customerInfo = customers.data.find(c => c.user_ID == loginSession.UID);

        res.render('customer/account', {
            category: category.data,
            userInfo: userInfo.data,
            customerInfo,
            loginSession
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error. Try again.');
    }
};

exports.myOrders = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) 
            return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const category = await axios.get(base_url + '/category');
        const customers = await axios.get(base_url + '/customer');
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID);
        
        const orders = await axios.get(base_url + '/order/' + findCustomer.customer_ID);
        

        res.render('customer/myOrder', { category: category.data, orders: orders.data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error fetching orders.');
    }
};

exports.orderDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const loginSession = req.session.loginSession;
        if (!loginSession) 
            return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        console.log(id);
        const category = await axios.get(base_url + '/category');
        
        

        res.render('customer/myOrder', { category: category.data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error fetching orders.');
    }
};

exports.editInfo = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const category = await axios.get(base_url + '/category');
        const customers = await axios.get(base_url + '/customer');
        const user = await axios.get(base_url + '/user/' + loginSession.UID);
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID);

        res.render('customer/editInfo', {
            category: category.data,
            customer: findCustomer,
            userId: loginSession.UID,
            email: user.data.email,
            loginSession
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error loading info.');
    }
};

exports.newInfo = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const loginSession = req.session.loginSession;
        const customers = await axios.get(base_url + '/customer');
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID);

        await axios.put(base_url + '/customer/' + findCustomer.customer_ID, { name, phone, address });
        await axios.put(base_url + '/user/' + loginSession.UID, { email });

        res.redirect('/account');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error updating info.');
    }
};

exports.changePass = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const category = await axios.get(base_url + '/category');
        if (!loginSession) return res.redirect('/signin');

        res.render('customer/changePass', { category: category.data });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error loading password page.');
    }
};

exports.newPass = async (req, res) => {
    try {
        const { oldPass, newPass, confirmPass } = req.body;
        const loginSession = req.session.loginSession;
        const user = await axios.get(base_url + '/user/' + loginSession.UID);

        if (!loginSession) return res.redirect('/signin');

        if (user.data.password != oldPass) {
            return res.send(`
                <script>
                    alert("Old password incorrect.");
                    window.location.href = "/change-password";
                </script>
            `);
        }

        if (newPass != confirmPass) {
            return res.send(`
                <script>
                    alert("Passwords don't match.");
                    window.location.href = "/change-password";
                </script>
            `);
        }

        await axios.put(base_url + '/user/' + loginSession.UID, { password: newPass });
        res.redirect('/account');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error changing password.');
    }
};

exports.checkOut = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const { cart } = req.query;

        await axios.delete(base_url + '/cart/' + cart);

        res.status(200).json({ message: 'Cart cleared.' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error clearing cart.' });
    }
};