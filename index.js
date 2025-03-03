require("dotenv").config();

const express = require('express');
const app = express();
const axios = require('axios');
const path = require("path");
var bodyParser = require('body-parser');

const api_port = process.env.API_PORT || 3000;
const base_url = `http://localhost:${api_port}`;

// ตั้งค่าระบบ Template Engine
app.set("views", path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

// ==================== Home Page (แสดงสินค้าทั้งหมด) ====================
app.get("/", async (req, res) => {
    try {
        const productList = await axios.get(base_url + '/products'); // ดึงสินค้าทั้งหมด
        const categories = await axios.get(base_url + '/category'); // ดึงหมวดหมู่
        res.render("products", { products: productList.data, category: categories.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading product list.');
    }
});

// ==================== View Product (แสดงรายละเอียดสินค้า) ====================
app.get("/product/:id", async (req, res) => {
    try {
        const product = await axios.get(base_url + '/products/' + req.params.id);
        res.render("product", { product: product.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading product details.');
    }
});

// ==================== Create Product (หน้าเพิ่มสินค้า) ====================
app.get("/create", async (req, res) => {
    try {
        const categories = await axios.get(base_url + '/category'); // ดึงหมวดหมู่
        res.render("create", { categories: categories.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading create page.');
    }
});

// ส่งข้อมูลเพื่อเพิ่มสินค้าใหม่
app.post("/create", async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            category_id: req.body.category_id,
            unitPrice: req.body.unitPrice,
            stockQty: req.body.stockQty
        };
        await axios.post(base_url + '/products', data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating product.');
    }
});

// ==================== Update Product (หน้าแก้ไขสินค้า) ====================
app.get("/update/:id", async (req, res) => {
    try {
        const product = await axios.get(base_url + '/products/' + req.params.id);
        const categories = await axios.get(base_url + '/category');
        res.render("update", { product: product.data, categories: categories.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading update page.');
    }
});

// ส่งข้อมูลเพื่ออัปเดตสินค้า
app.post("/update/:id", async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            category_id: req.body.category_id,
            unitPrice: req.body.unitPrice,
            stockQty: req.body.stockQty
        };
        await axios.put(base_url + '/products/' + req.params.id, data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating product.');
    }
});

// ==================== Delete Product (ลบสินค้า) ====================
app.get("/delete/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/products/' + req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting product.');
    }
});

// ==================== Start Server ====================
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
