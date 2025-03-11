const axios = require('axios');
const { use } = require('../routes');


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


// function convertThaiDateToISO(thaiDate) {
//     const [day, month, year] = thaiDate.split('/').map(num => parseInt(num, 10));
//     const gregorianYear = year - 543; // แปลงปีจากพุทธศักราชเป็นคริสต์ศักราช
//     const date = new Date(gregorianYear, month - 1, day);  // สร้าง Date object

//     return date.toISOString();  // เช่น "2025-03-10T00:00:00.000Z"
// }


exports.search = async (req, res) => {
    const loginSession = req.session.loginSession;
    if (!loginSession) return res.redirect('/signin');

    const query = req.query.query;
    const from = req.query.table;
    const orderDate = req.query.orderDate; // Fetch the date from query

    try {
        const [productList, brand, categories, customers, users, orders] = await Promise.all([
            axios.get(base_url + '/product'),
            axios.get(base_url + '/brand'),
            axios.get(base_url + '/category'),
            axios.get(base_url + '/customer'),
            axios.get(base_url + '/user'),
            axios.get(base_url + '/order') // Fetch the orders data
        ]);

        const brandMap = brand.data.reduce((map, b) => {
            map[b.brand_ID] = b.name;
            return map;
        }, {});

        let filteredData = [];

        if (from === 'Brand') {
            filteredData = brand.data.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchBrand', {
                brand: filteredData,
                query: query,
            });
        } 
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
        else if (from === 'Category') {
            filteredData = categories.data.filter(category => category.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchCategory', {
                category: filteredData,
                query: query,
            });
        } 
        else if (from === 'Customer') {
            filteredData = customers.data.filter(customer => customer.name.toLowerCase().includes(query.toLowerCase()));
            res.render('admin/searchCustomer', {
                customer: filteredData,
                user: users.data,
                query: query,
            });
        } 
        // else if (from === 'Order') {
        //     filteredData = orders.data.filter(order => {
        //         // ตรวจสอบคำค้นที่เป็นรหัสคำสั่งซื้อ (1, D-0001)
        //         const matchQuery = `${order.orderID}`.includes(query) || `D-${String(order.orderID).padStart(4, '0')}` === query;
        
        //         // ตรวจสอบวันที่ ถ้ามีการกรอกวันในฟอร์ม
        //         let matchDate = true;
        //         if (orderDate) {
        //             const formattedOrderDate = convertThaiDateToISO(orderDate);  // แปลงวันที่จากไทยเป็น ISO
        //             // ตรวจสอบวันที่ในฐานข้อมูลกับวันที่ที่แปลง
        //             matchDate = order.orderDate.startsWith(formattedOrderDate.split('T')[0]);  // เปรียบเทียบแค่วันที่ (YYYY-MM-DD)
        //         }
        
        //         return matchQuery && matchDate;
        //     });
        
        //     res.render('admin/searchOrder', {
        //         orders: filteredData,
        //         query: query,
        //         orderDate: orderDate
        //     });
        // }
        else {
            res.status(400).send('Invalid search type');
        }

    } 
    catch (error) {
        console.error('Error in search:', error.message);
        res.status(500).send('An error occurred while processing your search.');
    }
};

exports.adminManage = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const users = await axios.get(base_url + '/user');

        const user = users.data.filter(user => user.userType == 2 && user.user_ID != loginSession.UID);

        res.render('admin/manageAdmin', { user });

    } catch (error) {
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

exports.viewOrder = async (req, res) => {
    try {
        const { id } = req.query;  
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const orders = await axios.get(base_url + '/order');
        const orderDetail = await axios.get(base_url + '/order-detail');
        const products = await axios.get(base_url + '/product');

        const findOrder = orders.data.filter(order => order.customer_ID == id);

        res.render('admin/customerOrder', { 
            orders: findOrder,
            products: products.data,
            orderDetail: orderDetail.data,
            id, 
        });
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
};

exports.viewOrderDetail = async (req, res) => {
    try {
        const { id } = req.query;  
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const ordersDetail = await axios.get(base_url + '/order-detail/' + id);
        const products = await axios.get(base_url + '/product');
        const brands = await axios.get(base_url + '/brand')

        res.render('admin/orderDetail', { 
            orders: ordersDetail.data, 
            products: products.data, 
            brands: brands.data,
            id
        });
    } 
    catch (error) {
        console.error('Error in admin:', error.message);
        res.status(500).send('An error occurred while loading the admin dashboard page.');
    }
};