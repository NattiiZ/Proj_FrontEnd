const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.signup = async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');

        res.render("auth/signup", { category: category.data });
    } 
    catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.checkReg = async (req, res) => 
{
    try {
        const { username, password, email, check_password } = req.body;

        const users = await axios.get(base_url + '/user');

        if ( users.data.find(user => user.username === username) ) {
            return res.send(`
                <script>
                    alert("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/signup";
                </script>
            `);
        }

        if ( users.data.find(user => user.email === email) ) {
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
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.regForm = async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');

        res.render("customer/reg_form", { category: category.data });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.createUser = async (req, res) => 
{
    try {
        const { username, password, email } = req.session.userData || {};
        const { name, phone, address } = req.body;

        await axios.post(base_url + '/user', { username, password, email});
        const user = await axios.get(base_url + '/user');
        await axios.post(base_url + '/customer', { name, phone, address, user_ID: user.data[user.data.length-1].user_ID });
        const userId = await axios.get(`${base_url}/user/${user.data[user.data.length-1].user_ID}`);

        req.session.loginSession = { role_Id: userId.data.userType_ID, UID: userId.data.user_ID };
        delete req.session.userData;

        res.redirect("/");
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};