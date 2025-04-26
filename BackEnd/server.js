require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1MeyaqLR291M2MpthSENmvs3qg28uyXYP5Mmyg3SrEN4';
const WORDPRESS_API_URL = 'https://caicc.nileofhope.org/wp-json/gf/v2/entries';
const AUTH_TOKEN = 'Basic YWRtaW46Nll6eCBkbG5JIGIxanQgZmNsRSBHcWhhIGZDck0=';

if (!SPREADSHEET_ID) {
    console.error('❌ SPREADSHEET_ID not found in .env');
    process.exit(1);
}

// STEP 1: Initialize Google Sheets service
async function getGoogleSheetService() {
    try {
        console.log('🔐 Initializing Google Sheets service...');
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'fleet-standard-456312-u8-bbf83ed15cb8.json'),
            scopes: SCOPES,
        });
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        // Test connection
        await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });

        console.log('✅ Google Sheets service initialized successfully.');
        return sheets;
    } catch (error) {
        console.error('❌ Failed to initialize Google Sheets service:', error.message);
        throw error;
    }
}

// STEP 2: Append data to Google Sheet
async function updateSheet(data, spreadsheetId = SPREADSHEET_ID) {
    try {
        const sheets = await getGoogleSheetService();

        const values = [[
            data.lid || '', // entry_id
            data.FirstName || '', // first_name
            data.LastName || '', // last_name
            data.Phone || '', // phone
            data.Title || '', // title
            data.Email || '', // email
            data.ScannedURL || '', // pdf_url
            'Registration Form', // form_name
            new Date().toISOString() // timestamp
        ]];

        console.log('📤 Data to send to Google Sheets:', values);
        console.log('📊 Using Spreadsheet ID:', spreadsheetId);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1!A:G', // Updated to match 7 columns
            valueInputOption: 'RAW',
            requestBody: { values }
        });

        console.log('✅ Data appended to Google Sheet successfully.');
        return response.data;
    } catch (error) {
        console.error('❌ Error appending to Google Sheet:', error.message);
        throw error;
    }
}

// STEP 3: Fetch entry from Gravity Forms
async function fetchEntryData(id) {
    try {
        console.log(`🔎 Fetching entry from Gravity Forms with ID: ${id}`);
        const response = await axios({
            method: 'get',
            url: `${WORDPRESS_API_URL}/${id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            }
        });

        const entry = response.data;
        console.log('📥 Gravity Forms entry data received:', entry);

        return {
            success: true,
            data: {
                Name: `${entry['1.3'] || ''} ${entry['1.6'] || ''}`,
                FirstName: entry['1.3'] || '',
                LastName: entry['1.6'] || '',
                Email: entry['2'] || '',
                Phone: entry['5'] || '',
                Title: entry['26'] || '',
                Preferred_Contact: entry['8'] || ''
            }
        };
    } catch (error) {
        console.error('❌ Error fetching Gravity Forms entry:', error.response?.data || error.message);
        throw new Error(`Failed to fetch entry data: ${error.message}`);
    }
}

// STEP 4: Extract ID (lid or eid) from scanned URL
function extractIdFromUrl(url) {
    try {
        console.log('🔍 Extracting lid or eid from URL:', url);
        const urlObj = new URL(url);
        const lid = urlObj.searchParams.get('lid');
        const eid = urlObj.searchParams.get('eid');

        if (lid) {
            console.log(`➡️ Found lid: ${lid}`);
            return lid;
        } else if (eid) {
            console.log(`➡️ Found eid: ${eid}`);
            return eid;
        } else {
            throw new Error('LID or EID parameter not found in URL');
        }
    } catch (error) {
        throw new Error('Invalid URL format');
    }
}

// STEP 5: Handle registration POST endpoint
app.post('/register', async (req, res) => {
    try {
        const { scanned_url, spreadsheet_id } = req.body;
        console.log('📩 Incoming registration request with scanned_url:', scanned_url);
        console.log('📊 Spreadsheet ID:', spreadsheet_id || 'Using default');

        if (!scanned_url) {
            console.warn('⚠️ No scanned_url provided in request');
            return res.status(400).json({ success: false, error: 'No URL provided' });
        }

        const entryId = extractIdFromUrl(scanned_url);

        const entryData = await fetchEntryData(entryId);

        const registrationData = {
            ...entryData.data,
            lid: entryId,
            ScannedURL: scanned_url
        };

        // Use provided spreadsheet_id or fall back to default
        await updateSheet(registrationData, spreadsheet_id);

        console.log('✅ Registration successful and data pushed to Google Sheet');
        res.json({ success: true, data: registrationData });
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
