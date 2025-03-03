require("dotenv").config();

const express = require('express');
const app = express();
const axios = require('axios');
const path = require("path");
var bodyParser = require('body-parser');

const api_port = process.env.API_PORT || 3000;
const base_url = `http://localhost:${api_port}`;




app.set("views" , path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

// app.use(express.static(__dirname + '/public'));

const customerRoutes = express.Router();
const adminRoutes = express.Router();

app.use("/customer", customerRoutes);
app.use("/admin", adminRoutes);




app.get("/", async (req, res) => {
    try{
        const productList = await axios.get(base_url + '/products');
        const categories = await axios.get(base_url + '/category');
        res.render("customer/products", { products: productList.data, category: categories.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/book/:id", async (req, res) => {
    try{
        const response = await axios.get(base_url + '/books/' + req.params.id);
        res.render("book", { book: response.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/create", (req, res) => {
    res.render("create");
});

app.post("/create", async (req, res) => {
    try{
        const data = {title: req.body.title, author: req.body.author };
        await axios.post(base_url + '/books', data);
        res.redirect("/");
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/update/:id", async (req, res) => {
    try{
        const response = await axios.get(
        base_url + '/books/' + req.params.id);
        res.render("update", { book: response.data });
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.post("/update/:id", async (req, res) => {
    try{
        const data = {title: req.body.title, author: req.body.author };
        await axios.put(base_url + '/books/' + req.params.id, data);
        res.redirect("/");
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/delete/:id", async (req, res) => {
    try{
        await axios.delete(base_url + '/books/' + req.params.id);
            res.redirect("/");
    }catch(err){
        console.error(err);
        res.status(500).send('Error');
    }
});



const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    });