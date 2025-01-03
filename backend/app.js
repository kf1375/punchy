const express = require('express');
const app = express();
const port = 8000;

app.use(express.json());

// Sample POST route for checking if the user exists
app.post('/api/check_user', (req, res) => {
    const { userId } = req.body;
    console.log('Check User')
    if (userId === '12345') {
        res.json({ exists: true });
    } else {
        res.json({ exists: false });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
