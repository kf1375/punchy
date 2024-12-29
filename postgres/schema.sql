-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    UserID SERIAL PRIMARY KEY,
    TelegramID INTEGER UNIQUE NOT NULL,
    Name TEXT NOT NULL,
    Premium INTEGER NOT NULL,
    CreatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Devices Table
CREATE TABLE IF NOT EXISTS Devices (
    DeviceID SERIAL PRIMARY KEY,
    DeviceName TEXT NOT NULL,
    Status TEXT DEFAULT 'Active',
    TelegramID INTEGER NOT NULL,
    CreatedAt TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (TelegramID)
        REFERENCES Users(TelegramID)
        ON DELETE CASCADE
);

-- DeviceData Table (SensorData)
CREATE TABLE IF NOT EXISTS DeviceData (
    DataID SERIAL PRIMARY KEY,
    DeviceID INTEGER NOT NULL,
    ParameterName TEXT NOT NULL,
    ParameterValue REAL NOT NULL,
    Timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_device
        FOREIGN KEY (DeviceID)
        REFERENCES Devices(DeviceID)
        ON DELETE CASCADE
);

-- UserInteractions Table
CREATE TABLE IF NOT EXISTS UserInteractions (
    InteractionID SERIAL PRIMARY KEY,
    TelegramID INTEGER NOT NULL,
    DeviceID INTEGER NOT NULL,
    Action TEXT NOT NULL,
    Details TEXT,  -- Optionally, you can change this to JSON or JSONB for structured data
    Timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_interaction
        FOREIGN KEY (TelegramID)
        REFERENCES Users(TelegramID)
        ON DELETE CASCADE,
    CONSTRAINT fk_device_interaction
        FOREIGN KEY (DeviceID)
        REFERENCES Devices(DeviceID)
        ON DELETE CASCADE
);