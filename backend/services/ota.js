const crypto = require('crypto')
const axios = require('axios')

const { BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD, BITBUCKET_WEBHOOK_SECRET } = process.env;

let latestFirmware = null;

// Fetch the latest firmware details from Bitbucket Downloads API
const fetchLatestFirmware = async () => {
    const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0/repositories/michaelsprojects/demo_device/downloads';

    try {
        const response = await axios.get(BITBUCKET_API_URL, {
            auth: { username: BITBUCKET_USERNAME, password: BITBUCKET_APP_PASSWORD }
        });

        const downloads = response.data.values;
        if (downloads && downloads.length > 0) {
            downloads = downloads.sort((a, b) => new Date(b.created_on) - new Date(a.created_on));
            const latest = downloads[0];

            // Extract the version from the file name
            const fileName = latest.name; // Example: "v0.0.1.bin"
            const versionMatch = fileName.match(/^v[\d.]+/); // Match pattern like "v0.0.1"
            const version = versionMatch ? versionMatch[0] : 'unknown'; // Default to 'unknown' if no match

            latestFirmware = {
                version: version,
                downloadUrl: latest.links.self.href,
                releaseDate: latest.created_on
            };
            return latestFirmware;
        }
    } catch (error) {
        console.error('Error fetching firmware:', error);
    }

    return null;
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

        const commitStatus = req.body.comit_status;
        console.log(req.body)
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

module.exports = {
    fetchLatestFirmware,
    getLatestFirmware,
    handleOTAWebhook,
}