const axios = require('axios');
const { render } = require('ejs');
const { check } = require('prettier');


const base_url = `http://localhost:${process.env.API_PORT || 3000}`;




exports.cart = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;

        if (!loginSession)
            return res.redirect(`/signin?from=${encodeURIComponent('/cart')}`);

        const category = await axios.get(base_url + '/category');
        const brand = await axios.get(base_url + '/brand');
        const product = await axios.get(base_url + '/product');

        const carts = await axios.get(base_url + '/cart');
        let checkCart = carts.data.find(cart => cart.user_ID == loginSession.UID);

        if (!checkCart) {
            const newCart = await axios.post(base_url + '/cart', { user_ID: loginSession.UID });
            checkCart = newCart.data;
        }

        const cartId = checkCart.cart_ID;
        const cartItems = await axios.get(base_url + '/cart-item/' + cartId);
        
        let items = cartItems.data;

        res.render('customer/cart', { 
            loginSession,
            category: category.data, 
            brands: brand.data,
            products: product.data, 
            cartId,
            cartItem: items
        });
    }
    catch (err) {
        console.error('Error in cart:', err.message);
        res.status(500).send('An error occurred while fetching your cart.');
    }
};

exports.getProduct = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        const { url, Id } = req.body;

        // ตรวจสอบการเข้าสู่ระบบ
        if (!loginSession) {
            return res.redirect(`/signin?from=${encodeURIComponent(url)}`);
        }

        // ดึงข้อมูลตะกร้าของผู้ใช้
        const { data: carts } = await axios.get(base_url + '/cart');
        let checkCart = carts.find(cartItem => cartItem.user_ID === loginSession.UID);

        // หากไม่มีตะกร้า ให้สร้างใหม่
        if (!checkCart) {
            const { data: newCart } = await axios.post(base_url + '/cart', { user_ID: loginSession.UID });
            checkCart = newCart;
        }

        const cartId = checkCart.cart_ID;

        // ตรวจสอบว่าสินค้าอยู่ในตะกร้าแล้วหรือไม่
        const { data: cartItems } = await axios.get(base_url + '/cart-item');
        const findItem = cartItems.find(item => item.cart_ID == cartId && item.product_ID == Id);

        if (findItem) {
            // ถ้าสินค้าซ้ำ ให้อัปเดตจำนวน
            await axios.put(base_url + '/cart-item', {
                cartId: findItem.cart_ID,
                productId: Id,
                quantity: findItem.quantity + 1
            });
        } else {
            // ถ้าไม่มี ให้เพิ่มสินค้าใหม่
            await axios.post(base_url + '/cart-item', {
                cart_ID: cartId,
                product_ID: Id,
                quantity: 1
            });
        }

        // ดึงข้อมูลสินค้าและแบรนด์
        const { data: product } = await axios.get(`${base_url}/product/${Id}`);
        const { data: brand } = await axios.get(`${base_url}/brand/${product.brand_ID}`);

        // แจ้งเตือนและกลับไปยังหน้าที่แล้ว
        res.send(`
            <script>
                alert("เพิ่ม ${brand.name} ${product.name} ลงตะกร้าเรียบร้อยแล้ว");
                window.location.href = "${url}";
            </script>
        `);
    } 
    catch (error) {
        console.error('Error in getProduct:', error.message);
        res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
};


// exports.updateQty = async (req, res) => {
//     try {
//         const { cartId, productId, quantity } = req.body;

//         console.log(productId, quantity);
        

//         await axios.put(base_url + '/cart-item', { cartId, productId, quantity });
//     } 
//     catch (error) {
//         console.error('Error in updateQty:', error.message);
//         res.status(500).send('An error occurred while updating the quantity.');
//     }
// };



// let previousProductId = null;  // ตัวแปรเก็บ productId ที่ส่งมาในคำขอก่อนหน้า
// let previousQuantity = null;   // ตัวแปรเก็บ quantity ที่ส่งมาในคำขอก่อนหน้า

// exports.updateQty = async (req, res) => {
//     try {
//         const { cartId, productId, quantity } = req.body;

//         console.log("Received:", productId, quantity);

//         // ถ้าค่าซ้ำกับข้อมูลก่อนหน้า ให้หน่วงเวลาและลองส่งใหม่
//         if (previousProductId === productId && previousQuantity === quantity) {
//             console.log("ข้อมูลนี้ถูกส่งมาแล้วในรอบก่อนหน้า");

//             // ตั้งเวลารอ (2000ms หรือ 2 วินาที)
//             setTimeout(async () => {
//                 console.log("รอ 2 วินาทีแล้วลองส่งข้อมูลใหม่");
//                 await resendUpdate(cartId, productId, quantity, res);
//             }, 500);

//             return;  // ไม่ให้ส่งคำขอในครั้งนี้
//         }

//         // ถ้าไม่ซ้ำ อัปเดตตัวแปรเก็บค่า
//         previousProductId = productId;
//         previousQuantity = quantity;

//         // ส่งคำขอ PUT ไปยัง API
//         await axios.put(base_url + '/cart-item', { cartId, productId, quantity });

//         console.log(`อัปเดตสินค้า ${productId} เป็นจำนวน ${quantity}`);

//         res.status(200).json({ message: 'Quantity successfully updated' });

//     } catch (error) {
//         console.error('Error in updateQty:', error.message);
//         res.status(500).send('An error occurred while updating the quantity.');
//     }
// };

// // ฟังก์ชันที่ใช้ในการส่งข้อมูลใหม่เมื่อผ่านดีเลย์
// const resendUpdate = async (cartId, productId, quantity, res) => {
//     try {
//         // ส่งคำขอ PUT ไปยัง API หลังจากที่หน่วงเวลาแล้ว
//         await axios.put(base_url + '/cart-item', { cartId, productId, quantity });

//         console.log(`อัปเดตสินค้า ${productId} เป็นจำนวน ${quantity} หลังจากหน่วงเวลา`);

//         res.status(200).json({ message: 'Quantity successfully updated after delay' });
//     } catch (error) {
//         console.error('Error in resendUpdate:', error.message);
//         res.status(500).send('An error occurred while updating the quantity after delay.');
//     }
// };




exports.deleteItem = async (req, res) => {
    try {
        const { id, item } = req.body;

        await axios.delete(base_url + `/cart-item/${id}/${item}`);

        res.redirect('/cart')
    } 
    catch (error) {
        console.error('Error in deleteItem:', error.message);
        res.status(500).send('An error occurred while deleting the item from your cart.');
    }
};


exports.checkOut = async (req, res) => {
    try {
        const loginSession = req.session.loginSession;
        if (!loginSession) return res.redirect('/signin');

        const cart = JSON.parse(req.body.cart);

        // คำนวณราคารวม
        const totalAmount = cart.reduce((total, item) => total + (item.quantity * item.Product.unitPrice), 0);

        // สร้างคำสั่งซื้อใหม่
        await axios.post(base_url + '/order', {
            customer_ID: loginSession.UID,
            totalAmount,
            status_ID: 1, // 1 = รอดำเนินการ
        });

        // ดึงคำสั่งซื้อของผู้ใช้เพื่อตรวจสอบ order_ID
        const orders = await axios.get(base_url + '/order');
        const order_ID = orders.data.filter(order => order.customer_ID == loginSession.UID).at(-1).order_ID;

        if (!order_ID) {
            throw new Error('Order not found for the current user.');
        }

        console.log(`✅ Order created: ${order_ID}`);
        
        

        // เพิ่มสินค้าไปยัง order-detail
        for (const item of cart) {
            console.log(item);
            
            await axios.post(base_url + '/order-detail', {
                order_ID: order_ID,
                product_ID: item.product_ID,
                quantity: item.quantity,
                unitPrice: item.Product.unitPrice,
                subtotal: (item.Product.unitPrice * item.quantity),
            });
            console.log(`📦 Added to OrderDetails: product_ID=${item.product_ID}`);
        }

        // ลบสินค้าทั้งหมดออกจากตะกร้า
        for (const item of cart) {
            await axios.delete(`${base_url}/cart-item/${item.cart_ID}/${item.product_ID}`);
            console.log(`🗑️ Deleted from cart: product_ID=${item.product_ID}`);
        }
    } catch (error) {
        console.error('❌ Error in checkOut:', error.message);
        res.status(500).send('An error occurred during checkout.');
    }
};
