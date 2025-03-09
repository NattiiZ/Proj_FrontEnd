const axios = require('axios');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.home = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        const [product, brand, category] = await Promise.all([
            axios.get(base_url + '/product'),
            axios.get(base_url + '/brand'),
            axios.get(base_url + '/category')
        ]);

        res.render('user/home', { 
            products: product.data, 
            category: category.data, 
            brands: brand.data,
            loginSession
        });
    } catch (error) {
        console.error('Error in home:', error.message);
        res.status(500).send('An error occurred while loading the homepage.');
    }
};

exports.search = async (req, res) => {
    const loginSession = req.session.loginSession;
    const query = req.query.query;

    try {
        const [productList, brand, categories] = await Promise.all([
            axios.get(base_url + '/product'),
            axios.get(base_url + '/brand'),
            axios.get(base_url + '/category')
        ]);

        const brandMap = brand.data.reduce((map, b) => {
            map[b.brand_ID] = b.name;
            return map;
        }, {});

        const filteredProducts = productList.data.filter(product => {
            const brandName = brandMap[product.brand_ID] || '';
            const searchText = `${brandName} ${product.name}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        res.render('user/search', {
            products: filteredProducts,
            category: categories.data,
            brands: brand.data,
            query: query,
            loginSession
        });
    } catch (error) {
        console.error('Error in search:', error.message);
        res.status(500).send('An error occurred while processing your search.');
    }
};

exports.productDetail = async (req, res) => {
    const loginSession = req.session.loginSession;
    const { brand, Id } = req.query;

    try {
        const product = await axios.get(base_url + '/product/');
        const category = await axios.get(base_url + '/category');

        res.render('user/detail', { 
            products: product.data, 
            category: category.data, 
            brand, 
            Id,
            loginSession
        });
    } catch (err) {
        console.error('Error in productDetail:', err.message);
        res.status(500).send('An error occurred while loading the product details.');
    }
};

exports.categoryList = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        const category = await axios.get(base_url + '/category');

        res.render('user/category', { category: category.data, loginSession });
    } catch (err) {
        console.error('Error in categoryList:', err.message);
        res.status(500).send('An error occurred while loading the category list.');
    }
};

exports.categorySelected = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const categoryId = parseInt(req.params.id);

        const [categoriesRes, productsRes, brandsRes] = await Promise.all([
            axios.get(base_url + '/category'),
            axios.get(base_url + '/product'),
            axios.get(base_url + '/brand')
        ]);

        const categories = categoriesRes.data;
        const products = productsRes.data; 

        const selectedCategory = categories.find(cat => cat.category_ID === categoryId);

        if (!selectedCategory)
            return res.status(404).send("ไม่พบหมวดหมู่");

        const filteredProducts = products.filter(product => product.category_ID === categoryId);

        res.render('user/thisCategory', {
            category: categories,
            products: filteredProducts,
            name: selectedCategory.name,
            brands: brandsRes.data,
            loginSession
        });
    } catch (error) {
        console.error('Error in categorySelected:', error.message);
        res.status(500).send('An error occurred while loading the category details.');
    }
};
