const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.accountMenu = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect('/signin');

        const [category, userInfo, customers] = await Promise.all([
            axios.get(base_url + '/category'),
            axios.get(`${base_url}/user/${loginSession.UID}`),
            axios.get(base_url + '/customer')
        ]);

        const customerInfo = customers.data.find(c => c.user_ID == loginSession.UID);

        res.render('customer/account', {
            category: category.data,
            userInfo: userInfo.data,
            customerInfo,
            loginSession
        });

    } catch (err) {
        console.error('Error:', err.message);
        res.redirect('/')
    }
};

exports.myOders = async (req, res) =>
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);

        const category = await axios.get(base_url + '/category');
        const customers = await axios.get(base_url + '/customer')
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID)
        const orders = await axios.get(base_url + '/order/' + findCustomer.customer_ID);

        res.render('customer/myOrder', { category: category.data, orders: orders.data })
    } 
    catch (error) {
        console.error('Error:', err.message);
        res.redirect('/account')
    }
}

exports.editInfo = async (req, res) =>
{
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);

        const category = await axios.get(base_url + '/category');
        const customers = await axios.get(base_url + '/customer')
        const user = await axios.get(base_url + '/user/' + loginSession.UID)
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID)

        res.render('customer/editInfo', { 
            category: category.data, 
            customer: findCustomer,
            userId: loginSession.UID, 
            email: user.data.email,
            loginSession
        })
    } 
    catch (error) {
        console.error('Error:', err.message);
        res.redirect('/account')
    }
}

exports.newInfo = async (req, res) =>
{
    try {
        const { name, email, phone, address } = req.body;
        const loginSession = req.session.loginSession;
        const customers = await axios.get(base_url + '/customer')
        const findCustomer = customers.data.find(customer => customer.user_ID == loginSession.UID);

        await axios.put(base_url + '/customer/' + findCustomer.customer_ID, { name, phone, address })
        await axios.put(base_url + '/user/' + loginSession.UID, { email })

        res.redirect('/account')
    } 
    catch (error) {
        console.error('Error:', err.message);
        res.redirect('/account')
    }
}

exports.changePass = async (req, res) =>
{
    try {
        const loginSession = req.session.loginSession;
        const category = await axios.get(base_url + '/category');

        if (!loginSession)
            return res.redirect('/signin');

        res.render('customer/changePass', { category: category.data });
    } 
    catch (error) {
        console.error('Error:', err.message);
        res.redirect('/account')
    }
}

exports.newPass = async (req, res) =>
{
    try {
        const { oldPass, newPass, confirmPass } = req.body;
        const loginSession = req.session.loginSession;
        const user = await axios.get(base_url + '/user/' + loginSession.UID);

        if (!loginSession)
            return res.redirect('/signin');

        if (user.data.password != oldPass) {
            return res.send(`
                <script>
                    alert("รหัสผ่านเดิมไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/change-password";
                </script>
            `);
        }
        
        if (newPass != confirmPass) {
            return res.send(`
                <script>
                    alert("รหัสผ่านไม่ตรงกัน กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/change-password";
                </script>
            `);
        }

        await axios.put(base_url + '/user/' + loginSession.UID, { password: newPass })
        res.redirect('/account')
    } 
    catch (error) {
        console.error('Error:', err.message);
        res.redirect('/account')
    }
}