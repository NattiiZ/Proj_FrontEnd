require("dotenv").config();

const express = require('express');
const app = express();
const axios = require('axios');
const path = require("path");
const bodyParser = require('body-parser');


app.set("views" , path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(__dirname + '/public'));


const api_port = process.env.API_PORT || 3000;
const base_url = `http://localhost:${api_port}`;




app.get("/", async (req, res) => 
{
    try {
        const product = await axios.get(base_url + '/product');
        const brand = await axios.get(base_url + '/brand');
        const category = await axios.get(base_url + '/category');


        res.render("customer/home", { 
            products: product.data, 
            category: category.data, 
            brands: brand.data 
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/detail", async (req, res) => 
{
    const { brand, Id } = req.query;

    try {
        const product = await axios.get(base_url + '/product/');
        const category = await axios.get(base_url + '/category');


        res.render("customer/detail", { 
            products: product.data, 
            category: category.data, 
            brand, 
            Id 
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/search", async (req, res) => 
{
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


        res.render("customer/search", {
            products: filteredProducts,
            category: categories.data,
            brands: brand.data,
            query: query
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error during search.');
    }
});

app.get("/all_category", async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');


        res.render("customer/category", { 
            category: category.data 
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/category/:id", async (req, res) => 
{
    try {
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


        res.render("customer/prodCat", {
            category: categories,
            products: filteredProducts,
            name: selectedCategory.name,
            brands: brandsRes.data
        });

    } 
    catch (err) {
        console.error(err);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});



app.get("/cart", async (req, res) => 
{
    try {
        const product = await axios.get(base_url + '/product');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');

        res.render("customer/cart", { 
            products: product.data, 
            category: category.data, 
            brands: brand.data 
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/account", async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');
        const account = await axios.get(base_url + '/user');
        const customer = await axios.get(base_url + '/customer');
        res.render("customer/account", { 
            category: category.data 
        });
    }
    catch(err) {
        console.error(err);
        res.status(500).send('Error');
    }
});



app.get("/login", async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');

        res.render("login", { 
            category: category.data
        });
    } 
    catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/register", async (req, res) => 
{
    try {
        const category = await axios.get(base_url + '/category');

        res.render("register", { 
            category: category.data
        });
    } 
    catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/dashboard", async (req, res) => 
{
    try {
        const users = await axios.get(base_url + '/user');
        const orders = await axios.get(base_url + '/order');
        const product = await axios.get(base_url + '/product');
        const category = await axios.get(base_url + '/category');

        res.render("dashboard", { 
            users: users.data, 
            orders: orders.data, 
            products: product.data, 
            category: category.data 
        });
    } 
    catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});



const host_port = process.env.HOST_PORT || 5000;

app.listen(host_port, () => {
    console.log(`Server listening at http://localhost:${host_port}`);
    });