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


exports.addAdmin = async (req, res) => 
    {
    try {
        const { username, email, password, check_password } = req.body;

        const user = await axios.get(base_url + '/user')
        const findUser = user.data.find(user => user.username === username || user.email === email)

        if (findUser) {
            return res.send(`
                <script>
                    alert('ชื่อผู้ใช้หรืออีเมลนี้มีอยู่แล้วในระบบ');
                    window.history.back();
                </script>
            `);
        }

        if (password !== check_password) {
            return res.send(`
                <script>
                    alert('รหัสผ่านไม่ตรงกัน');
                    window.history.back();
                </script>
            `);
        }

        await axios.post(base_url + '/user', {
            username,
            email,
            password,
            userType: 2
        })

        res.send(`
            <script>
                alert('เพิ่มผู้ดูแลสำเร็จ');
                window.location.href = '/admin/manage';
            </script>
        `);
    } 
    catch (err) {
        console.error('Error adding admin:', err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มผู้ดูแล');
    }
};

exports.removeAdmin = async (req, res) => 
{
    try {
        const loginSession = req.session.loginSession;
        const { adminID } = req.body;

        const users = await axios.get(base_url + '/user');

        const userToRemove = users.data.find(user => user.user_ID == adminID);

        console.log("send : ", adminID);
        console.log("find : ", userToRemove);
        
        

        if (loginSession.UID == adminID) {
            return res.status(400).json({ message: 'คุณไม่สามารถลบตัวเองได้' });
        }

        if (userToRemove && userToRemove.userType == 2) {
            await axios.delete(base_url + '/user/' + adminID);

            res.send(`
                <script>
                    alert('ลบผู้ดูแลสำเร็จ');
                    window.location.href = '/admin/manage';
                </script>
            `);
        } else {
            return res.status(400).json({ message: 'ไม่สามารถลบผู้ดูแลประเภทนี้ได้' });
        }
    } 
    catch (err) {
        console.error('Error removing admin:', err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการลบผู้ดูแล');
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

            await axios.post(base_url + '/product', { 
                name, brand_ID,
                category_ID,
                unitPrice, 
                stockQty,
                imgName, 
                detail
            });

            res.send(`
                <script>
                    alert('เพิ่มสินค้าสำเร็จ');
                </script>
            `);

            res.redirect('/admin/product');
        });
    } catch (err) {
        console.error('Error adding product:', err.message);
        res.status(500).send('An error occurred while adding the product.');
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

            res.send(`
                <script>
                    alert('เพิ่มหมวดหมู่สินค้าสำเร็จ');
                </script>
            `);

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

        res.send(`
            <script>
                alert('เพิ่มแบรนด์สำเร็จ');
            </script>
        `);

        res.redirect('/admin/brand');
    } 
    catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
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
}

exports.delete = async (req, res) => 
{
    try {
        const { table, id } = req.params;

        await axios.delete(base_url + `/${table}/${id}` );

        res.send(`
            <script>
                alert('ลบสินค้าสำเร็จ');
            </script>
        `);

        res.redirect('/admin/' + table)
    }
    catch (err) {
        console.error('Error in cart:', err.message);
        res.status(500).send('An error occurred while fetching your cart.');
    }
};;


exports.editProduct = async (req, res) => 
{
    try {
        const { id } = req.query

        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const brand = await axios.get(base_url + '/brand');
        const category = await axios.get(base_url + '/category');
        const product = await axios.get(base_url + '/product');
        const findProduct = product.data.find(product => product.product_ID == id)

        res.render('admin/editProduct', { 
            brand: brand.data,
            category: category.data,
            product: findProduct,
            id
        });
    } 
    catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
    }
};

exports.editCategory = async (req, res) => 
{
    try {
        const { id } = req.query

        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const categorys = await axios.get(base_url + '/category');
        const findCategory = categorys.data.find(category => category.category_ID == id)


        res.render('admin/editCategory', { category: findCategory, id });

    } 
    catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
    }
};

exports.editBrand = async (req, res) => 
{
    try {
        const { id } = req.query

        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect(`/signin?from=${encodeURIComponent(req.url)}`);

        const brands = await axios.get(base_url + '/brand');
        const findBrand = brands.data.find(brand => brand.brand_ID == id)

        res.render('admin/editBrand', { brand: findBrand, id });
    } 
    catch (err) {
        console.error('Error adding category:', err.message);
        res.status(500).send('An error occurred while adding the category.');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        upload.single('img')(req, res, async (err) => {
            if (err) return res.status(400).send({ error: err.message });

            const { name, brand_ID, category_ID, unitPrice, stockQty, detail, product_ID } = req.body;

            const categoryProductFolder = path.join(productFolder, category_ID);

            if (!fs.existsSync(categoryProductFolder)) {
                console.log(`คำเตือน: โฟลเดอร์หมวดหมู่ ${categoryProductFolder} ไม่มีอยู่`);
            }

            let imgName = req.file ? generateFileName(name, req.file.originalname) : null;

            if (!imgName) {
                const product = await axios.get(base_url + '/product/' + product_ID);
                imgName = product.data.imgName;
            } else {
                const newPath = path.join(categoryProductFolder, imgName);
                fs.renameSync(req.file.path, newPath);
            }

            await axios.put(base_url + '/product/' + product_ID, { 
                name, 
                brand_ID,
                category_ID,
                unitPrice, 
                stockQty,
                imgName, 
                detail
            });

            res.send(`
                <script>
                    alert('อัปเดตสินค้าสำเร็จ');
                    window.location.href = '/admin/product';
                </script>
            `);
        });
    } 
    catch (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า:', err.message);
        res.status(500).send('เกิดข้อผิดพลาดในการอัปเดตสินค้า');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        upload.single('img')(req, res, async (err) => {
            if (err) return res.status(400).send({ error: err.message });

            const { name, description, category_ID } = req.body;


            if (!category_ID) {
                return res.status(400).send('Category ID is required');
            }

            const categoryProductFolder = path.join(productFolder, category_ID.toString());

            let imgName = req.file ? generateFileName(name, req.file.originalname) : null;

            if (!imgName) {
                const category = await axios.get(base_url + '/category/' + category_ID);
                imgName = category.data.imgName; 
            }

            if (!imgName) {
                return res.status(400).send('Image name is required');
            }

            if (!fs.existsSync(categoryProductFolder)) {
                fs.mkdirSync(categoryProductFolder, { recursive: true });
            }

            if (req.file) {
                const newPath = path.join(categoryProductFolder, imgName);
                fs.renameSync(req.file.path, newPath);
            }

            await axios.put(base_url + '/category/' + category_ID, { 
                name, 
                description,
                imgName
            });

            res.send(`
                <script>
                    alert('อัปเดตหมวดหมู่สินค้าสำเร็จ');
                    window.location.href = '/admin/category';
                </script>
            `);
        });
    } 
    catch (err) {
        console.error('Error updating category:', err.message);
        res.status(500).send('An error occurred while updating the category.');
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { name, brand_ID } = req.body;

        await axios.put(base_url + '/brand/' + brand_ID, { name });

        res.send(`
            <script>
                alert('อัปเดตแบรนด์สำเร็จ');
                window.location.href = '/admin/brand';
            </script>
        `);
    } 
    catch (err) {
        console.error('Error updating category:', err.message);
        res.status(500).send('An error occurred while updating the category.');
    }
};