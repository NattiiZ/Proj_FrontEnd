const axios = require('axios');


// const base_url = `http://localhost:${process.env.API_PORT || 3000}`;
const base_url = process.env.RukCom_IP




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
                UID: user.user_ID,
                userType: user.userType
            };

            if (req.session.loginSession.userType == 3)
                return res.redirect(lastUrl)
            else
                return res.redirect('/admin/dashboard')
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