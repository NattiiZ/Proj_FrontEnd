const axios = require('axios');
const { render } = require('ejs');
const { check } = require('prettier');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




const categoryFolder = path.join(__dirname, '..', 'public', 'img', 'Category');
if (!fs.existsSync(categoryFolder)) {
    fs.mkdirSync(categoryFolder, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, categoryFolder);
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // ขีดจำกัดขนาดไฟล์
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: File upload only supports the following filetypes - ' + filetypes);
        }
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

exports.add = async (req, res) => 
{
    try {
        const { table } = req.params;
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        res.render('admin/new' + table, { table })
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
            if (err) {
                return res.status(400).send({ error: err.message });
            }

            const { name, description } = req.body;
            const imgName = req.file ? req.file.filename : null;

            await axios.post(base_url + `/category`, { name, description, imgName });

            res.redirect('/admin/category');
        });
    } 
    catch (err) {
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