const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.dashboard = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const users = await axios.get(base_url + '/user');
        const user = users.data.find(user => user.user_ID == loginSession.UID)


        res.render('admin/dashboard', { user })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.search = async (req, res) => {
    const loginSession = req.session.loginSession;
    if (!loginSession) return res.redirect('/signin');

    const query = req.query.query;
    const from = req.query.table;  // รับค่าจาก table ว่ามาจากที่ไหน

    try {
        const [productList, brand, categories, customers] = await Promise.all([
            axios.get(base_url + '/product'),
            axios.get(base_url + '/brand'),
            axios.get(base_url + '/category'),
            axios.get(base_url + '/customer') // ดึงข้อมูลลูกค้าด้วย
        ]);

        const brandMap = brand.data.reduce((map, b) => {
            map[b.brand_ID] = b.name;
            return map;
        }, {});

        let filteredData = [];

        // หากคำค้นหามาจาก "Brand"
        if (from === 'Brand') {
            filteredData = brand.data.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchBrand', {
                brand: filteredData,
                query: query,
            });
        } 
        // หากคำค้นหามาจาก "Product"
        else if (from === 'Product') {
            filteredData = productList.data.filter(product => {
                const brandName = brandMap[product.brand_ID] || '';
                const searchText = `${brandName} ${product.name}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
            res.render('admin/searchProduct', {
                product: filteredData,
                category: categories.data,
                brand: brand.data,
                query: query,
            });
        } 
        // หากคำค้นหามาจาก "Category"
        else if (from === 'Category') {
            filteredData = categories.data.filter(category => category.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchCategory', {
                category: filteredData,
                query: query,
            });
        } 
        // หากคำค้นหามาจาก "Customer"
        else if (from === 'Customer') {
            filteredData = customers.data.filter(customer => customer.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchCustomer', {
                customer: filteredData,
                query: query,
            });
        } else {
            res.status(400).send('Invalid search type');
        }

    } catch (error) {
        console.error('Error in search:', error.message);
        res.status(500).send('An error occurred while processing your search.');
    }
};




exports.allCategory = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const category = await axios.get(base_url + '/category');

        res.render('admin/category', { category: category.data })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.allBrand = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const brand = await axios.get(base_url + '/brand');

        res.render('admin/brand', { brand: brand.data })
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.allProduct = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const product = await axios.get(base_url + '/product');
        const brand = await axios.get(base_url + '/brand');
        const category = await axios.get(base_url + '/category');

        res.render('admin/product', { product: product.data, brand: brand.data, category: category.data })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.Customers = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const customers = await axios.get(base_url + '/customer');
        const users = await axios.get(base_url + '/user');

        res.render('admin/customer', { customer: customers.data, user: users.data })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}

exports.adminEdit = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const users = await axios.get(base_url + '/user');
        const user = users.data.filter(user => user.userType == 1)

        res.render('admin/editUser', { user })

    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
}