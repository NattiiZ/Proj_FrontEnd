const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.signin = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const url = req.query.from || '/';

        if (loginSession) {
            return res.redirect('/');
        }

        const category = await axios.get(base_url + '/category');
        
        res.render('auth/signin', { category: category.data, url });
    } 
    catch (error) {
        console.error('Error in signin:', error.message);
        res.status(500).send('An error occurred while loading the sign-in page.');
    }
};

exports.checkLogin = async (req, res) => {
    try {
        const data = req.body;
        const lastUrl = req.query.from || '/';

        const users = await axios.get(base_url + '/user');

        const user = users.data.find(user => 
            user.email === data.email && user.password === data.password
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
                    alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
                    window.location.href = "/signin?from=${encodeURIComponent(lastUrl)}";
                </script>
            `);
        }
    } 
    catch (error) {
        console.error('Error in checkLogin:', error.message);
        res.status(500).send('An error occurred while checking the login credentials.');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};