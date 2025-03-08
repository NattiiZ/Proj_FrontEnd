const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.signup = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        if (loginSession)
            return res.redirect('/');

        const category = await axios.get(base_url + '/category');
        res.render('auth/signup', { category: category.data });
    } catch (err) {
        console.error('Error in signup:', err.message);
        res.status(500).send('An error occurred while loading the signup page. Please try again later.');
    }
};

exports.checkReg = async (req, res) => {
    try {
        const { username, password, email, check_password } = req.body;

        const users = await axios.get(base_url + '/user');

        if (users.data.find(user => user.username === username)) {
            return res.send(`
                <script>
                    alert("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/signup";
                </script>
            `);
        }

        if (users.data.find(user => user.email === email)) {
            return res.send(`
                <script>
                    alert("อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/signup";
                </script>
            `);
        }

        if (password !== check_password) {
            return res.send(`
                <script>
                    alert("รหัสผ่านยืนยันไม่ตรงกัน กรุณาลองใหม่อีกครั้ง");
                    window.location.href = "/signup";
                </script>
            `);
        }

        req.session.userData = { username, password, email };
        res.redirect(`/reg-form`);
    } catch (error) {
        console.error('Error in checkReg:', error.message);
        res.status(500).send('An error occurred while validating your registration. Please try again later.');
    }
};

exports.regForm = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        if (loginSession)
            return res.redirect('/');

        const category = await axios.get(base_url + '/category');
        res.render('auth/reg_form', { category: category.data });
    } catch (error) {
        console.error('Error in regForm:', error.message);
        res.status(500).send('An error occurred while loading the registration form. Please try again later.');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, email } = req.session.userData || {};
        const { name, phone, address } = req.body;

        await axios.post(base_url + '/user', { username, password, email });
        const user = await axios.get(base_url + '/user');
        await axios.post(base_url + '/customer', { name, phone, address, user_ID: user.data[user.data.length - 1].user_ID });
        const userId = await axios.get(base_url + '/user/' + user.data[user.data.length - 1].user_ID);

        req.session.loginSession = { role_Id: userId.data.userType_ID, UID: userId.data.user_ID };
        delete req.session.userData;

        res.redirect("/");
    } catch (error) {
        console.error('Error in createUser:', error.message);
        res.status(500).send('An error occurred while creating your account. Please try again later.');
    }
};
