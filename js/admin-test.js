// Admin Sheets Test Page Logic

async function initAdminTestPage() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.userType !== CONFIG.USER_TYPES.ADMIN) {
        showToast('Admin access required to view this page.', 'error');
        window.location.href = 'index.html';
        return;
    }

    const adminTestUser = document.getElementById('adminTestUser');
    if (adminTestUser) {
        adminTestUser.textContent = currentUser.name;
    }
}

function renderSheetTestOutput(result) {
    const outputContainer = document.getElementById('sheetTestOutput');
    if (!outputContainer) return;

    if (typeof result === 'string') {
        outputContainer.textContent = result;
        return;
    }

    outputContainer.textContent = JSON.stringify(result, null, 2);
}

async function runMetadataTest() {
    renderSheetTestOutput('Testing Google Sheets connection...');
    try {
        if (!sheetsAPI.accessToken) await sheetsAPI.requestAccessToken(true);
        const metadata = await sheetsAPI.getSheetMetadata();
        renderSheetTestOutput({ success: true, message: 'Connection successful', metadata });
    } catch (error) {
        renderSheetTestOutput({ success: false, error: error.message || error.toString() });
    }
}

async function runReadTest() {
    renderSheetTestOutput('Reading Users sheet...');
    try {
        if (!sheetsAPI.accessToken) await sheetsAPI.requestAccessToken(true);
        const values = await sheetsAPI.readSheet(CONFIG.SHEETS.USERS, 'A1:G20');
        renderSheetTestOutput({ success: true, rows: values.length, values });
    } catch (error) {
        renderSheetTestOutput({ success: false, error: error.message || error.toString() });
    }
}

async function runAppendTest() {
    renderSheetTestOutput('Appending test row to Users sheet...');
    try {
        if (!sheetsAPI.accessToken) await sheetsAPI.requestAccessToken(true);
        const row = [
            `admin-test-${Date.now()}`,
            'admin-test@sportmanager.com',
            'Admin API Test',
            CONFIG.USER_TYPES.ADMIN,
            '000-000-0000',
            'Test Location',
            new Date().toISOString()
        ];

        const result = await sheetsAPI.appendSheet(CONFIG.SHEETS.USERS, row);
        renderSheetTestOutput({ success: true, action: 'append', result });
    } catch (error) {
        renderSheetTestOutput({ success: false, error: error.message || error.toString() });
    }
}

function clearOutput() {
    const outputContainer = document.getElementById('sheetTestOutput');
    if (outputContainer) {
        outputContainer.textContent = 'Select a test to run.';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminTestPage);
} else {
    initAdminTestPage();
}

window.runMetadataTest = runMetadataTest;
window.runReadTest = runReadTest;
window.runAppendTest = runAppendTest;
window.clearOutput = clearOutput;
