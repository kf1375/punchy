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

// Check if user exists by Telegram ID
const userExists = async (telegram_id) => {
    try {
        const user = await db.oneOrNone('SELECT 1 FROM users WHERE telegram_id = $1', telegram_id);
        return user !== null;
    } catch (error) {
        throw new Error('Error checking if user exists: ' + error.message);
    }
};

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
const removeUser = async (telegram_id) => {
    try {
        const result = await db.result('DELETE FROM users WHERE telegram_id = $1', telegram_id);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error removing user: ' + error.message);
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

// Get a device by by serial_number
const getDeviceBySerialNumber = async (serial_number) => {
    try {
        const device = await db.oneOrNone('SELECT 1 FROM devices WHERE serial_number = $1', serial_number);
        return device !== null;
    } catch (error) {
        throw new Error('Error checking if device exists: ' + error.message);
    }
};

// Remove a device by serial_number
const removeDevice = async (serial_number) => {
    try {
        const result = await db.result('DELETE FROM devices WHERE serial_number = $1', serial_number);
        return result.rowCount > 0;
    } catch (error) {
        throw new Error('Error removing device: ' + error.message);
    }
};

module.exports = {
    userExists,
    addUser,
    removeUser,
    getUserByTelegramId,
    getUserDevices,
    addDevice,
    removeDevice,
    getDeviceById,
    getDeviceBySerialNumber,
};