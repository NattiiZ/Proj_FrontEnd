const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.accountMenu = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession) {
            return res.redirect('/signin');
        }

        const [category, userInfo, customers] = await Promise.all([
            axios.get(base_url + '/category'),
            axios.get(`${base_url}/user/${loginSession.UID}`),
            axios.get(base_url + '/customer')
        ]);

        const customerInfo = customers.data.find(c => c.user_ID == loginSession.UID);

        res.render('customer/account', {
            category: category.data,
            userInfo: userInfo.data,
            customerInfo
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};