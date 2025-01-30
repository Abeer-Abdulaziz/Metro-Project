const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// إعداد Express ليقبل بيانات النموذج (POST)
app.use(express.urlencoded({ extended: true }));

// عرض صفحة تسجيل الدخول عند زيارة المسار '/login'
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// معالجة بيانات تسجيل الدخول (POST)
app.post('/submit-login', (req, res) => {
    const { username, password } = req.body;

    // التحقق من اسم المستخدم وكلمة المرور المدخلة من قبل المستخدم
    if (username && password) {
        res.send(`✅ تم تسجيل الدخول بنجاح باستخدام اسم المستخدم: ${username}`);
    } else {
        res.send('❌ بيانات خاطئة، حاول مرة أخرى');
    }
});

// بدء السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
