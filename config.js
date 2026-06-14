// Configuration for Sport Manager Application

const CONFIG = {
    // Google Sheets API Configuration
    // Replace these with your actual values from Google Cloud Console
   // GOOGLE_SHEETS_API_KEY: 'AIzaSyCOI82IcTxCSTLKryyCjSlVnEPUROaKH0M',
    GOOGLE_OAUTH_CLIENT_ID: '210134173991-ibl96ui59edrmpanf5nqe4bpcpdotkcf.apps.googleusercontent.com',
    GOOGLE_SHEETS_ID: '1yWZCmJL-_OhXye9mGmL-gN5ci4ZFKBuG--0T_FxzrUg',
    
    // Sheet Names (these should match your Google Sheet tab names)
    SHEETS: {
        USERS: 'Users',
        TEAMS: 'Teams',
        MATCHES: 'Matches',
        UMPIRES: 'Umpires',
        SPORTS: 'Sports',
        GAME_SETUPS: 'GameSetups',
        PLAYER_ASSIGNMENTS: 'PlayerAssignments',
        UMPIRE_ASSIGNMENTS: 'UmpireAssignments'
    },

    // Application Settings
    APP_NAME: 'Sport Manager',
    APP_VERSION: '1.0.0',
    
    // Date/Time Settings
    DATE_FORMAT: 'MMM DD, YYYY',
    TIME_FORMAT: 'hh:mm A',
    
    // User Types
    USER_TYPES: {
        PLAYER: 'player',
        MANAGER: 'manager',
        ADMIN: 'admin'
    },

    // Match Status
    MATCH_STATUS: {
        UPCOMING: 'upcoming',
        ONGOING: 'ongoing',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // User Ranks
    RANKS: {
        PROFESSIONAL: 'professional',
        ADVANCED: 'advanced',
        BEGINNER: 'beginner'
    },

    // Time Slots
    TIME_SLOTS: {
        MORNING: 'morning',
        AFTERNOON: 'afternoon',
        EVENING: 'evening'
    },

    // Days of Week
    DAYS: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    DAYS_FULL: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

    // Pagination
    ITEMS_PER_PAGE: 10,

    // Cache Configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds

    // Sports Categories
    SPORTS_CATEGORIES: {
        TEAM: 'team',
        INDIVIDUAL: 'individual',
        MIXED: 'mixed'
    }
};

// LocalStorage Keys
const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    AUTH_TOKEN: 'authToken',
    CACHED_DATA: 'cachedData',
    THEME: 'theme'
};

// Initialize the application
function initializeApp() {
    console.log(`Initializing ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`);
    
    // Check if user is logged in
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    
    if (!currentUser && !window.location.pathname.includes('index.html')) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
}

// Helper function to get the current user
function getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
}

// Helper function to set the current user
function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Helper function to clear the current user
function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Helper function to get authentication token
function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

// Helper function to set authentication token
function setAuthToken(token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

// Helper function to clear authentication token
function clearAuthToken() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
