const pgp = require('pg-promise')();

const { DATABASE_URL, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD } = process.env;

// Database connection
const db = pgp({
    host: DATABASE_HOST,        // Replace with your PostgreSQL host
    port: DATABASE_PORT,               // Default PostgreSQL port
    database: DATABASE_NAME, // Replace with your database name
    user: DATABASE_USER,         // Replace with your PostgreSQL user
    password: DATABASE_PASSWORD  // Replace with your PostgreSQL password
});

// Add a new user
const addUser = async (telegram_id, name, subscription_type) => {
    try {
        return await db.one(
            'INSERT INTO users (telegram_id, name, subscription_type) VALUES ($1, $2, $3) RETURNING *',
            [telegram_id, name, subscription_type]
        );
    } catch (error) {
        throw new Error('Error adding user: ' + error.message);
    }
};

// Remove a user by Telegram ID
const removeUser = async (user_id) => {
    try {
        const result = await db.result('DELETE FROM users WHERE user_id = $1', user_id);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error removing user: ' + error.message);
    }
};

// Get a user by User ID
const getUserByUserId = async (user_id) => {
    try {
        return await db.oneOrNone('SELECT * FROM users WHERE user_id = $1', user_id);
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Get a user by Telegram ID
const getUserByTelegramId = async (telegram_id) => {
    try {
        return await db.oneOrNone('SELECT * FROM users WHERE telegram_id = $1', telegram_id);
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
};

// Get all devices for a user by owner_id
const getUserDevices = async (owner_id) => {
    try {
        return await db.any('SELECT * FROM devices WHERE owner_id = $1', owner_id);
    } catch (error) {
        throw new Error('Error fetching user devices: ' + error.message);
    }
};

// Get all shared devices for a user by user_id
const getUserSharedDevices = async (user_id) => {
    try {
        return await db.any('SELECT * FROM shared_devices WHERE user_id = $1', user_id);
    } catch (error) {
        throw new Error('Error fething user shared devices: ' + error.message);
    }
}

// Add a new device
const addDevice = async (serial_number, name, owner_id) => {
    try {
        return await db.one(
            'INSERT INTO devices (serial_number, name, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [serial_number, name, owner_id]
        );
    } catch (error) {
        throw new Error('Error adding device: ' + error.message);
    }
};

// Get a device by device_id
const getDeviceById = async (device_id) => {
    try {
        return await db.oneOrNone('SELECT * FROM devices WHERE device_id = $1', device_id);
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
}

// Remove a device by device_id
const removeDevice = async (device_id) => {
    try {
        const result = await db.result('DELETE FROM devices WHERE device_id = $1', device_id);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error removing device: ' + error.message);
    }
};

// add new shared device 
const addSharedDevice = async (owner_id, user_id, device_id, access_level) => {
    try {
        return await db.one(
            'INSERT INTO shared_devices (owner_id, user_id, device_id, access_level) VALUES ($1, $2, $3, $4) RETURNING *',
            [owner_id, user_id, device_id, access_level]
        );
    } catch (error) {
        throw new Error('Error sharing device: ' + error.message);
    } 
}

// remove a shared device
const removeSharedDevice = async (user_id, device_id) => {
    try {
        const result = await db.result('DELETE FROM shared_devices WHERE user_id = $1 AND device_id = $2', [user_id, device_id]);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error removing shared device: ' + error.message);
    }
};

module.exports = {
    addUser,
    removeUser,
    getUserByUserId,
    getUserByTelegramId,
    getUserDevices,
    getUserSharedDevices,
    addDevice,
    removeDevice,
    getDeviceById,
    addSharedDevice,
    removeSharedDevice,
};