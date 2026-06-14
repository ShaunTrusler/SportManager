// Matches Module

class MatchesManager {
    constructor() {
        this.currentUser = getCurrentUser();
        this.matches = [];
        this.sports = [];
        this.umpires = [];
        this.currentMonth = new Date();
        this.selectedUmpires = [];
    }

    /**
     * Initialize matches manager
     */
    async init() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        await this.loadData();
        this.renderCalendar();
        this.setupEventListeners();
    }

    /**
     * Load data
     */
    async loadData() {
        try {
            // Load matches
            const matchesData = await sheetsAPI.readSheet(CONFIG.SHEETS.MATCHES);
            this.processMatches(matchesData);

            // Load sports
            const sportsData = await sheetsAPI.readSheet(CONFIG.SHEETS.SPORTS);
            this.processSports(sportsData);

            // Load umpires
            const umpiresData = await sheetsAPI.readSheet(CONFIG.SHEETS.UMPIRES);
            this.processUmpires(umpiresData);

            this.updateSportFilters();
        } catch (error) {
            console.error('Error loading matches data:', error);
            showToast('Error loading matches', 'error');
        }
    }

    /**
     * Process matches data
     */
    processMatches(data) {
        if (!data || data.length <= 1) return;

        this.matches = data.slice(1).map(row => ({
            id: row[0],
            date: row[1],
            time: row[2],
            sport: row[3],
            homeTeam: row[4],
            awayTeam: row[5],
            location: row[6],
            status: row[7],
            homeScore: row[8] || '-',
            awayScore: row[9] || '-',
            umpires: row[10] ? row[10].split(',') : [],
            notes: row[11] || ''
        }));
    }

    /**
     * Process sports data
     */
    processSports(data) {
        if (!data || data.length <= 1) return;

        this.sports = data.slice(1).map(row => ({
            id: row[0],
            name: row[1],
            category: row[2]
        }));
    }

    /**
     * Process umpires data
     */
    processUmpires(data) {
        if (!data || data.length <= 1) return;

        this.umpires = data.slice(1).map(row => ({
            id: row[0],
            name: row[1],
            email: row[2],
            rank: row[3],
            location: row[4],
            region: row[5],
            sports: row[6] ? row[6].split(',') : [],
            availableDays: row[7] ? row[7].split(',') : [],
            preferredTimes: row[8] ? row[8].split(',') : [],
            age: row[9]
        }));
    }

    /**
     * Update sport filters
     */
    updateSportFilters() {
        const sportSelect = document.getElementById('filterSport');
        if (sportSelect) {
            sportSelect.innerHTML = '<option value="">All Sports</option>';
            this.sports.forEach(sport => {
                const option = document.createElement('option');
                option.value = sport.name;
                option.textContent = sport.name;
                sportSelect.appendChild(option);
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // View toggle
        const calendarBtn = document.querySelector('[onclick*="switchView(\'calendar\')"]');
        const listBtn = document.querySelector('[onclick*="switchView(\'list\')"]');
        
        if (calendarBtn) calendarBtn.addEventListener('click', () => this.switchView('calendar'));
        if (listBtn) listBtn.addEventListener('click', () => this.switchView('list'));

        // Filters
        const searchInput = document.getElementById('searchMatches');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => this.searchMatches(e.target.value));
        }

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => this.filterMatches(e.target.value, 'status'));
        }

        const filterSport = document.getElementById('filterSport');
        if (filterSport) {
            filterSport.addEventListener('change', (e) => this.filterMatches(e.target.value, 'sport'));
        }
    }

    /**
     * Render calendar
     */
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        // Set header
        const monthName = this.currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const currentMonthEl = document.getElementById('currentMonth');
        if (currentMonthEl) currentMonthEl.textContent = monthName;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const calendarDays = document.getElementById('calendarDays');
        if (!calendarDays) return;

        calendarDays.innerHTML = '';
        const today = getCurrentDate();

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayEl = this.createDayElement(day, true);
            calendarDays.appendChild(dayEl);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEl = this.createDayElement(day, false, dateStr, dateStr === today);
            calendarDays.appendChild(dayEl);
        }

        // Next month days
        const totalCells = calendarDays.children.length;
        const remainingCells = 42 - totalCells;
        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createDayElement(day, true);
            calendarDays.appendChild(dayEl);
        }
    }

    /**
     * Create day element
     */
    createDayElement(day, isOtherMonth = false, dateStr = '', isToday = false) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        if (isOtherMonth) div.classList.add('other-month');
        if (isToday) div.classList.add('today');

        const dayNum = document.createElement('div');
        dayNum.className = 'calendar-day-number';
        dayNum.textContent = day;
        div.appendChild(dayNum);

        // Add matches for this day
        if (dateStr) {
            const dayMatches = this.matches.filter(m => m.date === dateStr);
            const matchesDiv = document.createElement('div');
            matchesDiv.className = 'calendar-day-matches';
            
            dayMatches.slice(0, 2).forEach(match => {
                const matchEl = document.createElement('div');
                matchEl.className = 'calendar-day-match';
                matchEl.textContent = `${match.sport}`;
                matchEl.title = `${match.homeTeam} vs ${match.awayTeam}`;
                matchEl.style.cursor = 'pointer';
                matchEl.onclick = (e) => {
                    e.stopPropagation();
                    this.showMatchDetails(match.id);
                };
                matchesDiv.appendChild(matchEl);
            });

            if (dayMatches.length > 2) {
                const more = document.createElement('div');
                more.className = 'calendar-day-match';
                more.textContent = `+${dayMatches.length - 2} more`;
                matchesDiv.appendChild(more);
            }

            div.appendChild(matchesDiv);
        }

        return div;
    }

    /**
     * Switch view
     */
    switchView(view) {
        const calendarView = document.getElementById('calendarView');
        const listView = document.getElementById('listView');
        const toggleBtns = document.querySelectorAll('.toggle-btn');

        toggleBtns.forEach(btn => btn.classList.remove('active'));

        if (view === 'calendar') {
            if (calendarView) calendarView.style.display = 'block';
            if (listView) listView.style.display = 'none';
            if (toggleBtns[0]) toggleBtns[0].classList.add('active');
        } else {
            if (calendarView) calendarView.style.display = 'none';
            if (listView) listView.style.display = 'block';
            if (toggleBtns[1]) toggleBtns[1].classList.add('active');
            this.renderListView();
        }
    }

    /**
     * Render list view
     */
    renderListView() {
        const matchesList = document.getElementById('matchesList');
        if (!matchesList) return;

        if (this.matches.length === 0) {
            matchesList.innerHTML = '<div class="loading">No matches found</div>';
            return;
        }

        matchesList.innerHTML = this.matches.map(match => `
            <div class="match-list-item" onclick="matchesManager.showMatchDetails('${match.id}')">
                <div class="match-list-info">
                    <div class="match-list-title">
                        <strong>${match.homeTeam} vs ${match.awayTeam}</strong>
                        <span class="sport-badge">${match.sport}</span>
                    </div>
                    <div class="match-list-meta">
                        <span>📅 ${formatDate(match.date)}</span>
                        <span>⏰ ${match.time}</span>
                        <span>📍 ${match.location}</span>
                    </div>
                </div>
                <div class="match-score">
                    <div class="score-display">${match.homeScore} - ${match.awayScore}</div>
                    <div class="score-text">${match.status}</div>
                </div>
                <div class="match-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); matchesManager.showMatchDetails('${match.id}')">View</button>
                    <button class="btn-edit" onclick="event.stopPropagation(); matchesManager.editMatch('${match.id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show match details
     */
    showMatchDetails(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        const modal = document.getElementById('matchDetailsModal');
        const content = document.getElementById('matchDetailsContent');

        if (!content) return;

        const isCompleted = match.status === CONFIG.MATCH_STATUS.COMPLETED;

        content.innerHTML = `
            <div class="match-details-content">
                <div class="match-details-header">
                    <div>
                        <h2>${match.homeTeam} vs ${match.awayTeam}</h2>
                        <p>${match.sport} • ${match.location}</p>
                    </div>
                    <span class="match-status status-${match.status}">${match.status}</span>
                </div>

                <div class="teams-score">
                    <div class="team-info">
                        <h3>${match.homeTeam}</h3>
                        <div class="score">${match.homeScore}</div>
                    </div>
                    <div class="vs-text">VS</div>
                    <div class="team-info">
                        <h3>${match.awayTeam}</h3>
                        <div class="score">${match.awayScore}</div>
                    </div>
                </div>

                <div class="match-info-section">
                    <h4>Match Information</h4>
                    <div class="match-info-row">
                        <span class="match-info-label">Date:</span>
                        <span>${formatDate(match.date)}</span>
                    </div>
                    <div class="match-info-row">
                        <span class="match-info-label">Time:</span>
                        <span>${match.time}</span>
                    </div>
                    <div class="match-info-row">
                        <span class="match-info-label">Location:</span>
                        <span>${match.location}</span>
                    </div>
                </div>

                <div class="umpires-section">
                    <h4>Match Officials</h4>
                    ${match.umpires && match.umpires.length > 0 ? `
                        <div class="umpires-list">
                            ${match.umpires.map(umpireId => {
                                const umpire = this.umpires.find(u => u.id === umpireId);
                                return umpire ? `
                                    <div class="umpire-item">
                                        <div class="umpire-name">${umpire.name}</div>
                                        <div class="umpire-role">${umpire.rank}</div>
                                    </div>
                                ` : '';
                            }).join('')}
                        </div>
                    ` : `
                        <div class="no-umpires-message">
                            No umpires assigned yet
                            ${this.currentUser.userType === CONFIG.USER_TYPES.MANAGER ? `
                                <button class="btn-assign-umpires" onclick="matchesManager.openUmpireSelection('${matchId}')">
                                    Assign Umpires
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;

        openModal('matchDetailsModal');
    }

    /**
     * Handle create match - REMOVED: Now handled in create-match.html
     * Search matches
     */
    searchMatches(query) {
        if (!query) {
            this.renderListView();
            return;
        }

        const filtered = this.matches.filter(match =>
            match.homeTeam.toLowerCase().includes(query.toLowerCase()) ||
            match.awayTeam.toLowerCase().includes(query.toLowerCase()) ||
            match.location.toLowerCase().includes(query.toLowerCase())
        );

        this.displayFilteredMatches(filtered);
    }

    /**
     * Filter matches
     */
    filterMatches(value, type) {
        if (!value) {
            this.renderListView();
            return;
        }

        const filtered = this.matches.filter(match => match[type] === value);
        this.displayFilteredMatches(filtered);
    }

    /**
     * Display filtered matches
     */
    displayFilteredMatches(filtered) {
        const matchesList = document.getElementById('matchesList');
        if (!matchesList) return;

        if (filtered.length === 0) {
            matchesList.innerHTML = '<div class="loading">No matches found</div>';
            return;
        }

        matchesList.innerHTML = filtered.map(match => `
            <div class="match-list-item" onclick="matchesManager.showMatchDetails('${match.id}')">
                <div class="match-list-info">
                    <div class="match-list-title">
                        <strong>${match.homeTeam} vs ${match.awayTeam}</strong>
                        <span class="sport-badge">${match.sport}</span>
                    </div>
                    <div class="match-list-meta">
                        <span>📅 ${formatDate(match.date)}</span>
                        <span>⏰ ${match.time}</span>
                        <span>📍 ${match.location}</span>
                    </div>
                </div>
                <div class="match-score">
                    <div class="score-display">${match.homeScore} - ${match.awayScore}</div>
                    <div class="score-text">${match.status}</div>
                </div>
                <div class="match-actions">
                    <button class="btn-view" onclick="event.stopPropagation(); matchesManager.showMatchDetails('${match.id}')">View</button>
                    <button class="btn-edit" onclick="event.stopPropagation(); matchesManager.editMatch('${match.id}')">Edit</button>
                </div>
            </div>
        `).join('');
    }
}

// Create matches manager instance
const matchesManager = new MatchesManager();

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => matchesManager.init());
} else {
    matchesManager.init();
}

// Close match details modal
function closeMatchDetailsModal() {
    closeModal('matchDetailsModal');
}

// Previous/Next month
function previousMonth() {
    matchesManager.currentMonth.setMonth(matchesManager.currentMonth.getMonth() - 1);
    matchesManager.renderCalendar();
}

function nextMonth() {
    matchesManager.currentMonth.setMonth(matchesManager.currentMonth.getMonth() + 1);
    matchesManager.renderCalendar();
}

// Switch view
function switchView(view) {
    matchesManager.switchView(view);
}

// Make functions globally available
window.matchesManager = matchesManager;
window.closeMatchDetailsModal = closeMatchDetailsModal;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.switchView = switchView;
