const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.signin = async (req, res) => 
{
    try {
        const url = req.query.from || '/';

        const category = await axios.get(base_url + '/category');
        
        res.render("auth/signin", { category: category.data, url});
    } 
    catch (err) {
        console.error('Error:', error.message);
        res.redirect('/')
    }
};


exports.checkLogin = async (req, res) => 
{
    try {
        const data = req.body;
        const lastUrl = req.query.from || '/';

        const users = await axios.get(base_url + '/user');

        const user = users.data.find(user => 
            user.username === data.username && user.password === data.password
        );

        if (user) {
            req.session.loginSession = { 
                role_Id: user.userType_ID, 
                UID: user.user_ID 
            };

            return res.redirect(user.userType_ID == process.env.ADMIN_ROLE ? '/admin-dashboard' : lastUrl);
        } else {
            res.send(`
                <script>
                    alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
                    window.location.href = "/signin?from=${encodeURIComponent(lastUrl)}";
                </script>
            `);
        }
    } 
    catch (err) {
        console.error('Error:', error.message);
        res.redirect('/')
    }
};

exports.logout = (req, res) => 
{
    req.session.destroy(() => {
        res.redirect('/');
    });
};
