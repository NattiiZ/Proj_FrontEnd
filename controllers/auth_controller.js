const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.signin = async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');

        res.render("signin", { category: category.data });
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.checkLogin = async (req, res) => 
{
    try {
        const data = req.body;
        let authenticated = false;

        const users = await axios.get(base_url + '/user');

        for (var i = 0; i < users.data.length; i++) 
        {
            if ((users.data[i].username === data.username) && (users.data[i].password === data.password)) 
            {
                authenticated = true;

                req.session.loginSession = { 
                    role_Id: users.data[i].userType_ID, 
                    UID: users.data[i].user_ID 
                };

                return res.redirect(users.data[i].userType_ID == process.env.ADMIN_ROLE ? '/dashboard' : '/');
            }
        }

        if (!authenticated) {
            res.send(`
                <script>
                    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"); 
                    window.location.href = "/signin";
                </script>
            `);
        }
    } 
    catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
};

exports.logout = (req, res) => 
{
    req.session.destroy(() => {
        res.redirect('/');
    });
};
