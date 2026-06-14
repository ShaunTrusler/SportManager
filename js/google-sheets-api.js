// Google Sheets API Integration

class GoogleSheetsAPI {
    constructor() {
        this.apiKey = CONFIG.GOOGLE_SHEETS_API_KEY;
        this.clientId = CONFIG.GOOGLE_OAUTH_CLIENT_ID;
        this.spreadsheetId = CONFIG.GOOGLE_SHEETS_ID;
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.accessToken = null;
        this.tokenClient = null;
        this.useLocalStorage = false;
    }

    /**
     * Initialize Google Sheets API
     */
    async init() {
        if (!this.spreadsheetId) {
            console.warn('Google Sheets spreadsheet ID is not configured. Falling back to localStorage.');
            this.useLocalStorage = true;
            return;
        }

        // Initialize OAuth token client if Google Identity Services is available
        if (this.clientId && window.google && google.accounts && google.accounts.oauth2) {
            try {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: this.clientId,
                    scope: 'https://www.googleapis.com/auth/spreadsheets',
                    callback: (resp) => {
                        if (resp && resp.access_token) {
                            this.accessToken = resp.access_token;
                            console.log('Obtained access token for Google Sheets via OAuth');
                        } else if (resp && resp.error) {
                            console.error('Token client error', resp);
                        }
                    }
                });
                console.log('Google OAuth token client initialized');
            } catch (err) {
                console.warn('Failed to initialize Google OAuth token client', err);
            }
        } else {
            console.warn('Google Identity Services not available or client ID missing; using localStorage fallback');
            this.useLocalStorage = true;
        }
    }

    /**
     * Request an OAuth access token (interactive if needed)
     */
    async requestAccessToken(interactive = true) {
        if (this.useLocalStorage) {
            throw new Error('Using localStorage fallback; OAuth not available');
        }

        if (!this.tokenClient) {
            throw new Error('Token client not initialized');
        }

        return new Promise((resolve, reject) => {
            let resolved = false;
            const onToken = () => {
                if (this.accessToken) {
                    resolved = true;
                    resolve(this.accessToken);
                }
            };

            try {
                this.tokenClient.requestAccessToken({ prompt: interactive ? 'consent' : '' });
            } catch (err) {
                return reject(err);
            }

            const start = Date.now();
            const interval = setInterval(() => {
                if (this.accessToken) {
                    clearInterval(interval);
                    resolved = true;
                    return resolve(this.accessToken);
                }

                if (Date.now() - start > 15000) {
                    clearInterval(interval);
                    if (!resolved) reject(new Error('Timed out waiting for access token'));
                }
            }, 300);
        });
    }

    async ensureAccessToken(interactive = true) {
        if (this.useLocalStorage) {
            return null;
        }

        if (this.accessToken) {
            return this.accessToken;
        }

        return await this.requestAccessToken(interactive);
    }

    /**
     * Get sheet metadata
     */
    async getSheetMetadata() {
        if (this.useLocalStorage) throw new Error('LocalStorage fallback in use');

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}`;
        const headers = {};
        if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    }

    /**
     * Read data from Google Sheet
     */
    async readSheet(sheetName, range = 'A:Z') {
        // Check cache first
        const cacheKey = `${sheetName}:${range}`;
        if (this.isValidCache(cacheKey)) {
            console.log(`Using cached data for ${sheetName}`);
            return this.cache.get(cacheKey);
        }

        if (this.useLocalStorage) {
            return this.readLocalStorage(sheetName);
        }

        try {
            const fullRange = `${sheetName}!${range}`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}`;
            const headers = {};
            if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;

            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const values = data.values || [];

            // Cache the data
            this.setCacheData(cacheKey, values);

            return values;
        } catch (error) {
            console.error(`Error reading sheet ${sheetName}:`, error);
            // Fallback to localStorage
            return this.readLocalStorage(sheetName);
        }
    }

    /**
     * Write data to Google Sheet
     */
    async writeSheet(sheetName, range, values) {
        if (this.useLocalStorage) {
            return this.writeLocalStorage(sheetName, values);
        }

        try {
            await this.ensureAccessToken(true);

            const fullRange = `${sheetName}!${range}`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED`;
            const headers = { 'Content-Type': 'application/json' };
            if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ values: [values] })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            this.clearSheetCache(sheetName);

            return await response.json();
        } catch (error) {
            console.error(`Error writing to sheet ${sheetName}:`, error);
            return this.writeLocalStorage(sheetName, values);
        }
    }

    /**
     * Append row to Google Sheet
     */
    async appendSheet(sheetName, values) {
        if (this.useLocalStorage) {
            return this.appendLocalStorage(sheetName, values);
        }

        try {
            await this.ensureAccessToken(true);

            const fullRange = `${sheetName}!A1`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${encodeURIComponent(fullRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
            const headers = { 'Content-Type': 'application/json' };
            if (this.accessToken) headers['Authorization'] = `Bearer ${this.accessToken}`;

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({ values: [values] })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            this.clearSheetCache(sheetName);
            
            return await response.json();
        } catch (error) {
            console.error(`Error appending to sheet ${sheetName}:`, error);
            return this.appendLocalStorage(sheetName, values);
        }
    }

    /**
     * Cache management
     */
    setCacheData(key, data) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + CONFIG.CACHE_DURATION);
    }

    isValidCache(key) {
        if (!this.cache.has(key)) return false;
        const expiry = this.cacheExpiry.get(key);
        if (Date.now() > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return false;
        }
        return true;
    }

    clearSheetCache(sheetName) {
        const keysToDelete = [];
        for (let key of this.cache.keys()) {
            if (key.startsWith(sheetName)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
        });
    }

    /**
     * LocalStorage Fallback Methods
     */
    readLocalStorage(sheetName) {
        const data = localStorage.getItem(`sheet_${sheetName}`);
        return data ? JSON.parse(data) : [];
    }

    writeLocalStorage(sheetName, values) {
        localStorage.setItem(`sheet_${sheetName}`, JSON.stringify([values]));
        return { success: true };
    }

    appendLocalStorage(sheetName, values) {
        const existing = this.readLocalStorage(sheetName);
        existing.push(values);
        localStorage.setItem(`sheet_${sheetName}`, JSON.stringify(existing));
        return { success: true };
    }
}

// Create global instance
const sheetsAPI = new GoogleSheetsAPI();

// Initialize when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sheetsAPI.init());
} else {
    sheetsAPI.init();
}
