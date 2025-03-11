const axios = require('axios');
const { render } = require('ejs');
const { check } = require('prettier');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




const categoryFolder = path.join(__dirname, '..', 'public', 'img', 'Category');
const productFolder = path.join(__dirname, '..', 'public', 'img', 'Product');

if (!fs.existsSync(categoryFolder)) fs.mkdirSync(categoryFolder, { recursive: true });
if (!fs.existsSync(productFolder)) fs.mkdirSync(productFolder, { recursive: true });

const generateFileName = (name, originalname) => {
    const sanitizedName = name.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    return `${sanitizedName}_${Date.now()}${path.extname(originalname)}`;
};

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, categoryFolder),
        filename: (req, file, cb) => cb(null, generateFileName(req.body.name, file.originalname))
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const isValid = filetypes.test(path.extname(file.originalname).toLowerCase()) && filetypes.test(file.mimetype);
        cb(isValid ? null : 'Error: Invalid file type', isValid);
    }
});


exports.delete = async (req, res) => 
{
    try {
        const { table, id } = req.params;

        await axios.delete(base_url + `/${table}/${id}` );

        res.redirect('/admin/' + table)
    }
    catch (err) {
        console.error('Error in cart:', err.message);
        res.status(500).send('An error occurred while fetching your cart.');
    }
};

exports.addNew = async (req, res) => 
{
    try {
        const { table } = req.params;
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const brand = await axios.get(base_url + '/brand');
        const category = await axios.get(base_url + '/category');

        res.render('admin/new' + table, { brand: brand.data, category: category.data })
    }
    catch (err) {
        console.error('Error in cart:', err.message);
        res.status(500).send('An error occurred while fetching your cart.');
    }
};

exports.addCategory = async (req, res) => 
{
    try {
        upload.single('img')(req, res, async (err) => {
            if (err) return res.status(400).send({ error: err.message });

            const { name, description } = req.body;
            const imgName = req.file ? req.file.filename : null;
            
            await axios.post(base_url + '/category', { name, description, imgName });
            const category = await axios.get(base_url + '/category')
            const categoryId = category.data.at(-1).category_ID

            const categoryProductFolder = path.join(productFolder, categoryId.toString());
            if (!fs.existsSync(categoryProductFolder)) fs.mkdirSync(categoryProductFolder);

            res.redirect('/admin/category');
        });
    } catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
    }
};


exports.addBrand = async (req, res) => 
{
    try {
        const { name } = req.body;

        await axios.post(base_url + `/brand`, { name });

        res.redirect('/admin/brand');
    } 
    catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
    }
};

exports.addProduct = async (req, res) => 
{
    try {
        upload.single('img')(req, res, async (err) => {
            if (err) return res.status(400).send({ error: err.message });

            const { name, brand_ID, category_ID, unitPrice, stockQty, detail } = req.body;

            const categoryProductFolder = path.join(productFolder, category_ID);
            if (!fs.existsSync(categoryProductFolder)) fs.mkdirSync(categoryProductFolder);

            const imgName = req.file ? generateFileName(name, req.file.originalname) : null;

            if (imgName && req.file) {
                const newPath = path.join(categoryProductFolder, imgName);
                fs.renameSync(req.file.path, newPath);
            }

            await axios.post(base_url + '/product', { name, brand_ID, category_ID, unitPrice, stockQty, imgName, detail });
            res.redirect('/admin/product');
        });
    } catch (err) {
        console.error('Error adding product:', err.message);
        res.status(500).send('An error occurred while adding the product.');
    }
};
