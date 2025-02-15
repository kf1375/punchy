const express = require('express');
const app = express();
const devicesRouter = require('./routes/devices');
const usersRouter = require('./routes/users');
const ota = require('./services/ota');
const port = 8000;

app.use(express.json());

// Use routers
app.use('/users', usersRouter);
app.use('/devices', devicesRouter);

// OTA routes
app.post('/ota-webhook', ota.handleOTAWebhook);
app.get('/update/:filename', ota.downloadFirmware);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

