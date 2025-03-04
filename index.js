require("dotenv").config();

const express = require('express');
const app = express();
const axios = require('axios');
const path = require("path");
const bodyParser = require('body-parser');


const api_port = process.env.API_PORT || 3000;
const base_url = `http://localhost:${api_port}`;


app.set("views" , path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(__dirname + '/public'));




app.get("/", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/home", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/search", async (req, res) => {
    const query = req.query.query;
    try {
        const productList = await axios.get(base_url + '/products');
        const categories = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        const filteredProducts = productList.data.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase())
        );

        res.render("customer/productSearch", {
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


app.get("/login", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/login", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/category", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/category", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/cart", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/cart", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/account", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/account", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/detail", async (req, res) => {
    try{
        const product = await axios.get(base_url + '/products');
        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brands');

        res.render("customer/productDetail", { products: product.data, category: category.data, brands: brand.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});



const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    });