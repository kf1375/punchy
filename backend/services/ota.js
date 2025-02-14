const crypto = require('crypto')
const axios = require('axios')
const fs = require('fs');
const path = require('path');

const { BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD, BITBUCKET_WEBHOOK_SECRET, BITBUCKET_DOWNLOADS_API_URL } = process.env;

manifest = null;

// Fetch the latest firmware details from Bitbucket Downloads API
const fetchLatestFirmware = async () => {
    try {
        const response = await axios.get(BITBUCKET_DOWNLOADS_API_URL, {
            auth: { username: BITBUCKET_USERNAME, password: BITBUCKET_APP_PASSWORD }
        });

        let downloads = response.data.values;
        if (!downloads || downloads.length === 0) {
            console.log("No firmware files found in Bitbucket downloads.");
            return null;
        }

        // Sort by date (latest first)
        downloads = downloads.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
        
        // Find firmware and filesystem binaries
        const firmwareFile = downloads.find(file => file.name.endsWith('firmware.bin'));
        const littlefsFile = downloads.find(file => file.name.endsWith('littlefs.bin'));

        if (!firmwareFile || !littlefsFile) {
            console.log("Firmware or filesystem binary is missing.");
            return null;
        }

        // Extract the version from the file name
        const firmwareUrl = firmwareFile.links.self.href;
        const littlefsUrl = littlefsFile.links.self.href;
        const releaseDate = firmwareFile.created_on;
        const versionMatch = firmwareFile.name.match(/^v[\d]+(\.[\d]+)*(?=_firmware\.bin)/);
        const version = versionMatch ? versionMatch[1] : 'unknown';
        
        // Ensure the 'firmware' directory exists
        const firmwareDir = path.join(__dirname, 'firmware');
        if (!fs.existsSync(firmwareDir)) {
            fs.mkdirSync(firmwareDir, { recursive: true }); // Create directory if it doesn't exist
        }

        // Download both firmware and filesystem binaries
        await downloadFile(firmwareUrl, path.join(firmwareDir, firmwareFile.name));
        await downloadFile(littlefsUrl, path.join(firmwareDir, littlefsFile.name));

        // Set the latest firmware metadata
        manifest = {
            type: "testiwhisk-device",
            version: version,
            host: "https://myremovedevice.com/",
            port: 443,
            bin: `api/update/${firmwareFile}`,
            littlefs: `api/update/${littlefsFile}`
        };

        // Write the JSON file
        const manifestPath = path.join(firmwareDir, 'manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4));
        console.log("manifest.json file created successfully:", manifestPath);
        return manifest;
    } catch (error) {
        console.error('Error fetching firmware:', error);
    }

    return null;
};

// Download a file from Bitbucket
const downloadFile = async (fileUrl, filePath) => {
    try {
        const writer = fs.createWriteStream(filePath);
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream',
            auth: { username: BITBUCKET_USERNAME, password: BITBUCKET_APP_PASSWORD }
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${fileUrl}:`, error);
    }
};

// Get the latest firmware details
const getLatestFirmware = () => latestFirmware;

// Handle webhook events
const handleOTAWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-hub-signature'];
        const payload = JSON.stringify(req.body);

        if (!signature) {
            return res.status(400).send('Missing X-Hub-Signature header');
        }

        const hmac = crypto.createHmac('sha256', BITBUCKET_WEBHOOK_SECRET);
        hmac.update(payload, 'utf8');
        const expectedSignature  = `sha256=${hmac.digest('hex')}`;

        if (signature !== expectedSignature) {
            return res.status(401).send('Invalid signature');
        }

        const commitStatus = req.body.commit_status;
        if (commitStatus && commitStatus.state === 'SUCCESSFUL') {
            console.log('Pipeline succeeded! Fetching download files...');
            const firmware = await fetchLatestFirmware();
            if (firmware) {
                console.log('Latest firmware fetched:', firmware);
                // notifyClients(firmware);
                return res.status(200).send('Firmware updated and clients notified.');
            }
        } else {
            console.log(`Pipeline status is not successful: ${commitStatus.state}`);
            return res.status(200).send(`Pipeline status is not successful: ${commitStatus.state}`);
        }
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
};

const downloadFirmware = async (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, 'firmware', fileName);

    try {
        // Check if the file exists
        const fileExists = fs.existsSync(filePath);

        if (fileExists) {
            // Send the file for download
            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    res.status(500).send('Internal Server Error');
                }
            });
        } else {
            // File not found
            res.status(404).send('File not found');
        }
    } catch (err) {
        // Handle unexpected errors
        console.error('Error during file download:', err);
        res.status(500).send('Internal Server Error');
    }
};
module.exports = {
    fetchLatestFirmware,
    getLatestFirmware,
    handleOTAWebhook,
    downloadFirmware,
}