// ================================================================
// EduManager — Student Management System
// script.js — Complete implementation
// ================================================================

class StudentManagementSystem {
    constructor() {
        this.currentView = 'dashboard';
        this.editingId = null;
        this.confirmCallback = null;
        this.init();
    }

    init() {
        this.initializeData();
        this.setupEventListeners();
        this.loadView('dashboard');
        this.setTodayDate();
        this.checkTheme();
    }

    // ================================================================
    // DATA MANAGEMENT
    // ================================================================

    initializeData() {
        const defaults = { students: [], courses: [], attendance: [], grades: [], events: [], activities: [] };
        Object.entries(defaults).forEach(([key, val]) => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(val));
        });
    }

    getData(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; }
        catch { return []; }
    }

    saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

    generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

    addActivity(type, description) {
        const activities = this.getData('activities');
        activities.unshift({ id: this.generateId(), type, description, timestamp: new Date().toISOString() });
        if (activities.length > 50) activities.pop();
        this.saveData('activities', activities);
    }

    // ================================================================
    // UTILITIES
    // ================================================================

    getTodayDate() { return new Date().toISOString().split('T')[0]; }

    setTodayDate() {
        const d = document.getElementById('attendanceDate');
        if (d) d.value = this.getTodayDate();
    }

    formatDate(s) {
        if (!s) return '—';
        return new Date(s).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateTime(s) {
        if (!s) return '—';
        const d = new Date(s);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return this.formatDate(s);
    }

    calculateGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    getGradeColor(grade) {
        const map = { A: '#10b981', B: '#0ea5e9', C: '#f59e0b', D: '#f97316', F: '#ef4444' };
        return map[grade] || '#6b7280';
    }

    escapeHtml(text) {
        const d = document.createElement('div');
        d.appendChild(document.createTextNode(text || ''));
        return d.innerHTML;
    }

    // ================================================================
    // EVENT LISTENERS
    // ================================================================

    setupEventListeners() {
        // Desktop nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                if (!view) return;
                document.querySelectorAll('.nav-btn, .nav-btn-mobile').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // sync mobile
                document.querySelectorAll('.nav-btn-mobile').forEach(b => {
                    if (b.dataset.view === view) b.classList.add('active');
                });
                this.loadView(view);
                this.closeMobileNav();
            });
        });

        // Mobile nav
        document.querySelectorAll('.nav-btn-mobile').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                document.querySelectorAll('.nav-btn, .nav-btn-mobile').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.nav-btn').forEach(b => {
                    if (b.dataset.view === view) b.classList.add('active');
                });
                this.loadView(view);
                this.closeMobileNav();
            });
        });

        // Hamburger
        document.getElementById('hamburgerBtn')?.addEventListener('click', () => this.toggleMobileNav());

        // Theme
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Modal closes
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', e => { if (e.target === modal) this.closeModal(); });
        });

        // ESC key
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeModal(); });

        // Form submissions
        document.getElementById('studentForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveStudent(); });
        document.getElementById('courseForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveCourse(); });
        document.getElementById('attendanceForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveAttendance(); });
        document.getElementById('gradeForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveGrade(); });
        document.getElementById('eventForm')?.addEventListener('submit', e => { e.preventDefault(); this.saveEvent(); });

        // Action buttons
        const btns = {
            addStudentBtn: () => this.openStudentModal(),
            newStudentBtn: () => this.openStudentModal(),
            addCourseBtn: () => this.openCourseModal(),
            newCourseBtn: () => this.openCourseModal(),
            markAttendanceBtn: () => this.openAttendanceModal(),
            addGradeBtn: () => this.openGradeModal(),
            addEventBtn: () => this.openEventModal(),
            exportBtn: () => this.exportData(),
            importBtn: () => document.getElementById('importFile').click(),
            generateReportBtn: () => this.generateReport(),
            printReportBtn: () => this.printReport(),
            clearFilters: () => this.clearFilters(),
            confirmAction: () => { if (this.confirmCallback) { this.confirmCallback(); this.closeModal(); } }
        };
        Object.entries(btns).forEach(([id, fn]) => document.getElementById(id)?.addEventListener('click', fn));

        // Search & filters
        document.getElementById('studentSearch')?.addEventListener('input', e => this.filterStudents(e.target.value));
        document.getElementById('studentFilterClass')?.addEventListener('change', () => this.filterStudents());
        document.getElementById('studentFilterStatus')?.addEventListener('change', () => this.filterStudents());
        document.getElementById('attendanceDate')?.addEventListener('change', () => { this.loadAttendanceTable(); this.loadAttendanceSummary(); });
        document.getElementById('gradeCourseFilter')?.addEventListener('change', () => { this.loadGradesTable(); this.loadGradesSummary(); });
        document.getElementById('importFile')?.addEventListener('change', e => this.importData(e.target.files[0]));
    }

    // ================================================================
    // MOBILE NAV
    // ================================================================

    toggleMobileNav() {
        const nav = document.getElementById('mobileNav');
        nav?.classList.toggle('open');
    }

    closeMobileNav() {
        document.getElementById('mobileNav')?.classList.remove('open');
    }

    // ================================================================
    // VIEW MANAGEMENT
    // ================================================================

    loadView(view) {
        this.currentView = view;
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}View`)?.classList.add('active');

        const handlers = {
            dashboard:  () => this.loadDashboard(),
            students:   () => { this.loadStudentsTable(); this.populateClassFilter(); this.updateStudentCount(); },
            courses:    () => this.loadCoursesGrid(),
            attendance: () => { this.loadAttendanceTable(); this.loadAttendanceSummary(); },
            grades:     () => { this.loadGradesTable(); this.populateCourseFilter(); this.loadGradesSummary(); },
            reports:    () => {}
        };
        handlers[view]?.();
    }

    // ================================================================
    // DASHBOARD
    // ================================================================

    loadDashboard() {
        const students   = this.getData('students');
        const courses    = this.getData('courses');
        const attendance = this.getData('attendance');
        const grades     = this.getData('grades');
        const activities = this.getData('activities');
        const events     = this.getData('events');

        // Stats
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalCourses').textContent  = courses.filter(c => c.status === 'active').length;

        const todayAtt = attendance.filter(a => a.date === this.getTodayDate());
        const rate = todayAtt.length
            ? Math.round((todayAtt.filter(a => a.status === 'present').length / todayAtt.length) * 100) + '%'
            : '—';
        document.getElementById('attendanceRate').textContent = rate;

        const avg = grades.length
            ? (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1) + '%'
            : '—';
        document.getElementById('avgGrade').textContent = avg;

        this.loadRecentActivities(activities.slice(0, 6));
        this.loadTopStudents(students, grades);
        this.loadUpcomingEvents(events);
    }

    loadRecentActivities(activities) {
        const c = document.getElementById('recentActivity');
        if (!c) return;
        if (!activities.length) {
            c.innerHTML = `<div class="empty-state"><i class="fas fa-clock-rotate-left"></i><p>No recent activities</p></div>`;
            return;
        }
        const iconMap = {
            student_added:     { icon: 'fa-user-plus',    color: '#4f46e5' },
            student_updated:   { icon: 'fa-user-pen',     color: '#7c3aed' },
            course_added:      { icon: 'fa-book-open',    color: '#10b981' },
            attendance_marked: { icon: 'fa-calendar-check',color: '#f59e0b' },
            grade_added:       { icon: 'fa-chart-bar',    color: '#ef4444' }
        };
        c.innerHTML = activities.map(a => {
            const { icon, color } = iconMap[a.type] || { icon: 'fa-bell', color: '#94a3b8' };
            return `<div class="activity-item">
                <div class="activity-icon" style="background:${color}"><i class="fas ${icon}"></i></div>
                <div class="activity-info">
                    <div class="activity-title">${this.escapeHtml(a.description)}</div>
                    <div class="activity-time">${this.formatDateTime(a.timestamp)}</div>
                </div>
            </div>`;
        }).join('');
    }

    loadTopStudents(students, grades) {
        const c = document.getElementById('topStudents');
        if (!c) return;
        const avgs = {};
        grades.forEach(g => {
            if (!avgs[g.studentId]) avgs[g.studentId] = { total: 0, count: 0 };
            avgs[g.studentId].total += g.score;
            avgs[g.studentId].count++;
        });
        const top = students
            .map(s => ({ ...s, avg: avgs[s.id] ? avgs[s.id].total / avgs[s.id].count : 0 }))
            .filter(s => s.avg > 0)
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 5);

        if (!top.length) {
            c.innerHTML = `<div class="empty-state"><i class="fas fa-trophy"></i><p>No grades recorded yet</p></div>`;
            return;
        }
        const colors = ['#f59e0b', '#94a3b8', '#cd7f32', '#10b981', '#4f46e5'];
        c.innerHTML = top.map((s, i) => `
            <div class="student-item">
                <div class="student-avatar" style="background:${colors[i]}">${s.firstName[0]}${s.lastName[0]}</div>
                <div class="student-info">
                    <div class="student-name">${this.escapeHtml(s.firstName)} ${this.escapeHtml(s.lastName)}</div>
                    <div class="student-grade">Class ${this.escapeHtml(s.class)}</div>
                </div>
                <div class="student-rank">${s.avg.toFixed(1)}%</div>
            </div>`).join('');
    }

    loadUpcomingEvents(events) {
        const c = document.getElementById('upcomingEvents');
        if (!c) return;
        const now = new Date();
        const soon = events
            .filter(e => new Date(e.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6);

        if (!soon.length) {
            c.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-days"></i><p>No upcoming events</p></div>`;
            return;
        }
        const typeMap = {
            exam:     { icon: 'fa-file-pen',       color: '#ef4444' },
            holiday:  { icon: 'fa-umbrella-beach', color: '#10b981' },
            meeting:  { icon: 'fa-users',           color: '#4f46e5' },
            activity: { icon: 'fa-person-running',  color: '#7c3aed' },
            other:    { icon: 'fa-calendar',        color: '#94a3b8' }
        };
        c.innerHTML = soon.map(e => {
            const { icon, color } = typeMap[e.type] || typeMap.other;
            return `<div class="event-item">
                <div class="event-icon" style="background:${color}"><i class="fas ${icon}"></i></div>
                <div class="event-info">
                    <div class="event-title">${this.escapeHtml(e.title)}</div>
                    <div class="event-date">${this.formatDate(e.date)}${e.time ? ' · ' + e.time : ''}</div>
                </div>
                <button class="action-btn delete" onclick="studentSystem.deleteEvent('${e.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div>`;
        }).join('');
    }

    // ================================================================
    // STUDENTS
    // ================================================================

    buildStudentRow(student) {
        return `<tr>
            <td><span style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-2)">${this.escapeHtml(student.studentId)}</span></td>
            <td><strong>${this.escapeHtml(student.firstName)} ${this.escapeHtml(student.lastName)}</strong></td>
            <td>${this.escapeHtml(student.email)}</td>
            <td>${student.phone ? this.escapeHtml(student.phone) : '<span style="color:var(--text-3)">—</span>'}</td>
            <td>${this.escapeHtml(student.class)}${student.section ? ` <span style="color:var(--text-3)">§${student.section}</span>` : ''}</td>
            <td><span class="status-badge badge-${student.status}">${student.status === 'active' ? 'Active' : 'Inactive'}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="studentSystem.openStudentModal('${student.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete" onclick="studentSystem.confirmDelete('student','${student.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }

    loadStudentsTable() {
        const students = this.getData('students');
        const c = document.getElementById('studentsTable');
        if (!c) return;
        if (!students.length) {
            c.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-user-graduate"></i><h3>No Students Found</h3><p>Add your first student to get started</p></div></td></tr>`;
            return;
        }
        c.innerHTML = students.map(s => this.buildStudentRow(s)).join('');
    }

    filterStudents(searchTerm = '') {
        const classFilter  = document.getElementById('studentFilterClass')?.value  || '';
        const statusFilter = document.getElementById('studentFilterStatus')?.value || '';
        const search = searchTerm || document.getElementById('studentSearch')?.value || '';
        const students = this.getData('students').filter(s => {
            const q = search.toLowerCase();
            const matchSearch = !search ||
                s.firstName.toLowerCase().includes(q) ||
                s.lastName.toLowerCase().includes(q)  ||
                s.email.toLowerCase().includes(q)     ||
                s.studentId.toLowerCase().includes(q);
            const matchClass  = !classFilter  || s.class  === classFilter;
            const matchStatus = !statusFilter || s.status === statusFilter;
            return matchSearch && matchClass && matchStatus;
        });

        const c = document.getElementById('studentsTable');
        if (!c) return;
        if (!students.length) {
            c.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-magnifying-glass"></i><h3>No Results</h3><p>Try adjusting your search or filters</p></div></td></tr>`;
            return;
        }
        c.innerHTML = students.map(s => this.buildStudentRow(s)).join('');
    }

    updateStudentCount() {
        const students = this.getData('students');
        const el = document.getElementById('studentCount');
        if (el) el.textContent = `${students.length} student${students.length !== 1 ? 's' : ''} enrolled`;
    }

    clearFilters() {
        ['studentSearch', 'studentFilterClass', 'studentFilterStatus'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        this.loadStudentsTable();
    }

    populateClassFilter() {
        const classes = [...new Set(this.getData('students').map(s => s.class))].sort();
        const f = document.getElementById('studentFilterClass');
        if (!f) return;
        f.innerHTML = '<option value="">All Classes</option>' + classes.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // ================================================================
    // COURSES
    // ================================================================

    loadCoursesGrid() {
        const courses = this.getData('courses');
        const c = document.getElementById('coursesGrid');
        if (!c) return;
        if (!courses.length) {
            c.innerHTML = `<div class="empty-state"><i class="fas fa-book-open"></i><h3>No Courses Found</h3><p>Add your first course to get started</p></div>`;
            return;
        }
        c.innerHTML = courses.map(course => `
            <div class="course-card">
                <div class="course-header">
                    <span class="course-code">${this.escapeHtml(course.code)}</span>
                    <span class="course-status status-${course.status}">${course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span>
                </div>
                <h3 class="course-title">${this.escapeHtml(course.name)}</h3>
                <div class="course-info">
                    <div class="course-info-item"><i class="fas fa-chalkboard-user"></i><span>${course.instructor ? this.escapeHtml(course.instructor) : 'Unassigned'}</span></div>
                    <div class="course-info-item"><i class="fas fa-award"></i><span>${course.credits || 3} Credits</span></div>
                    <div class="course-info-item"><i class="fas fa-clock"></i><span>${course.duration || 16} weeks</span></div>
                    ${course.schedule ? `<div class="course-info-item"><i class="fas fa-calendar-alt"></i><span>${this.escapeHtml(course.schedule)}</span></div>` : ''}
                    ${course.startDate ? `<div class="course-info-item"><i class="fas fa-calendar-day"></i><span>${this.formatDate(course.startDate)} – ${this.formatDate(course.endDate)}</span></div>` : ''}
                </div>
                ${course.description ? `<p class="course-description">${this.escapeHtml(course.description)}</p>` : ''}
                <div class="course-actions">
                    <button class="btn-secondary btn-sm" onclick="studentSystem.openCourseModal('${course.id}')"><i class="fas fa-pen"></i> Edit</button>
                    <button class="btn-danger btn-sm" onclick="studentSystem.confirmDelete('course','${course.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>`).join('');
    }

    // ================================================================
    // ATTENDANCE
    // ================================================================

    loadAttendanceSummary() {
        const date = document.getElementById('attendanceDate')?.value || this.getTodayDate();
        const records = this.getData('attendance').filter(a => a.date === date);
        const c = document.getElementById('attendanceSummary');
        if (!c) return;
        if (!records.length) { c.innerHTML = ''; return; }
        const counts = { present: 0, absent: 0, late: 0, excused: 0 };
        records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
        c.innerHTML = `
            <span class="summary-pill pill-total"><i class="fas fa-users"></i>${records.length} Total</span>
            <span class="summary-pill pill-present"><i class="fas fa-circle-check"></i>${counts.present} Present</span>
            <span class="summary-pill pill-absent"><i class="fas fa-circle-xmark"></i>${counts.absent} Absent</span>
            <span class="summary-pill pill-late"><i class="fas fa-clock"></i>${counts.late} Late</span>
            <span class="summary-pill pill-excused"><i class="fas fa-file-lines"></i>${counts.excused} Excused</span>`;
    }

    loadAttendanceTable() {
        const date = document.getElementById('attendanceDate')?.value || this.getTodayDate();
        const records = this.getData('attendance').filter(a => a.date === date);
        const students = this.getData('students');
        const c = document.getElementById('attendanceTable');
        if (!c) return;

        if (!records.length) {
            c.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No Records for ${this.formatDate(date)}</h3><p>Mark attendance to get started</p></div></td></tr>`;
            return;
        }
        const sMap = {};
        students.forEach(s => sMap[s.id] = s);

        c.innerHTML = records.map(r => {
            const s = sMap[r.studentId];
            if (!s) return '';
            return `<tr>
                <td><span style="font-family:var(--font-mono);font-size:.75rem;color:var(--text-2)">${this.escapeHtml(s.studentId)}</span></td>
                <td><strong>${this.escapeHtml(s.firstName)} ${this.escapeHtml(s.lastName)}</strong></td>
                <td>${this.escapeHtml(s.class)}</td>
                <td><span class="status-badge badge-${r.status}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
                <td>${this.formatDate(r.date)}</td>
                <td><span style="color:var(--text-2);font-size:.775rem">${r.remarks ? this.escapeHtml(r.remarks) : '—'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="studentSystem.openAttendanceModal('${r.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="action-btn delete" onclick="studentSystem.confirmDelete('attendance','${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // ================================================================
    // GRADES
    // ================================================================

    loadGradesSummary() {
        const courseFilter = document.getElementById('gradeCourseFilter')?.value || '';
        const grades = courseFilter
            ? this.getData('grades').filter(g => g.courseId === courseFilter)
            : this.getData('grades');
        const c = document.getElementById('gradesSummary');
        if (!c) return;
        if (!grades.length) { c.innerHTML = ''; return; }
        const avg = (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1);
        const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        grades.forEach(g => dist[this.calculateGrade(g.score)]++);
        c.innerHTML = `
            <span class="summary-pill pill-total"><i class="fas fa-list-check"></i>${grades.length} Grades</span>
            <span class="summary-pill pill-present"><i class="fas fa-chart-bar"></i>Avg: ${avg}%</span>
            ${Object.entries(dist).filter(([,v]) => v > 0).map(([g, v]) =>
                `<span class="summary-pill" style="background:rgba(${this.getGradeColor(g).replace('#','').match(/.{2}/g).map(h=>parseInt(h,16)).join(',')},0.1);color:${this.getGradeColor(g)};border:1px solid ${this.getGradeColor(g)}33">${g}: ${v}</span>`
            ).join('')}`;
    }

    loadGradesTable() {
        const courseFilter = document.getElementById('gradeCourseFilter')?.value || '';
        const grades = courseFilter
            ? this.getData('grades').filter(g => g.courseId === courseFilter)
            : this.getData('grades');
        const students = this.getData('students');
        const courses  = this.getData('courses');
        const c = document.getElementById('gradesTable');
        if (!c) return;

        if (!grades.length) {
            c.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No Grades Recorded</h3><p>Add your first grade to get started</p></div></td></tr>`;
            return;
        }

        const sMap = {}, cMap = {};
        students.forEach(s => sMap[s.id] = s);
        courses.forEach(c => cMap[c.id] = c);

        c.innerHTML = grades.map(g => {
            const s = sMap[g.studentId], course = cMap[g.courseId];
            if (!s || !course) return '';
            const letter = this.calculateGrade(g.score);
            return `<tr>
                <td><strong>${this.escapeHtml(s.firstName)} ${this.escapeHtml(s.lastName)}</strong></td>
                <td><span style="font-size:.775rem;color:var(--text-2)">${this.escapeHtml(course.code)}</span> ${this.escapeHtml(course.name)}</td>
                <td><span class="grade-badge grade-${letter}">${letter}</span></td>
                <td><strong>${g.score.toFixed(1)}%</strong></td>
                <td>${this.formatDate(g.date)}</td>
                <td><span style="color:var(--text-2);font-size:.775rem">${g.remarks ? this.escapeHtml(g.remarks) : '—'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="studentSystem.openGradeModal('${g.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="action-btn delete" onclick="studentSystem.confirmDelete('grade','${g.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    populateCourseFilter() {
        const courses = this.getData('courses');
        const f = document.getElementById('gradeCourseFilter');
        if (!f) return;
        f.innerHTML = '<option value="">All Courses</option>' +
            courses.map(c => `<option value="${c.id}">${c.code} – ${c.name}</option>`).join('');
    }

    // ================================================================
    // MODAL HELPERS
    // ================================================================

    openModal(modal) {
        if (!modal) return;
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        document.body.style.overflow = '';
        this.editingId = null;
    }

    // ================================================================
    // STUDENT MODAL
    // ================================================================

    openStudentModal(studentId = null) {
        const modal = document.getElementById('studentModal');
        const form  = document.getElementById('studentForm');
        if (!modal || !form) return;
        form.reset();
        this.editingId = studentId;
        document.getElementById('studentModalTitle').textContent = studentId ? 'Edit Student' : 'Add New Student';

        if (studentId) {
            const s = this.getData('students').find(x => x.id === studentId);
            if (s) {
                document.getElementById('studentId').value       = s.studentId;
                document.getElementById('firstName').value       = s.firstName;
                document.getElementById('lastName').value        = s.lastName;
                document.getElementById('email').value           = s.email;
                document.getElementById('phone').value           = s.phone || '';
                document.getElementById('dob').value             = s.dob || '';
                document.getElementById('gender').value          = s.gender || '';
                document.getElementById('class').value           = s.class;
                document.getElementById('section').value         = s.section || '';
                document.getElementById('enrollmentDate').value  = s.enrollmentDate;
                document.getElementById('status').value          = s.status;
                document.getElementById('address').value         = s.address || '';
            }
        } else {
            document.getElementById('studentId').value      = `STU${Date.now().toString().slice(-6)}`;
            document.getElementById('enrollmentDate').value = this.getTodayDate();
            document.getElementById('status').value         = 'active';
        }
        this.openModal(modal);
    }

    saveStudent() {
        const data = {
            id: this.editingId || this.generateId(),
            studentId:      document.getElementById('studentId').value.trim(),
            firstName:      document.getElementById('firstName').value.trim(),
            lastName:       document.getElementById('lastName').value.trim(),
            email:          document.getElementById('email').value.trim(),
            phone:          document.getElementById('phone').value.trim(),
            dob:            document.getElementById('dob').value,
            gender:         document.getElementById('gender').value,
            class:          document.getElementById('class').value.trim(),
            section:        document.getElementById('section').value.trim(),
            address:        document.getElementById('address').value.trim(),
            enrollmentDate: document.getElementById('enrollmentDate').value,
            status:         document.getElementById('status').value
        };
        if (!data.firstName || !data.lastName || !data.email || !data.class) {
            this.showToast('Please fill all required fields', 'error'); return;
        }
        const students = this.getData('students');
        const idx = students.findIndex(s => s.id === data.id);
        if (idx > -1) {
            students[idx] = data;
            this.addActivity('student_updated', `Updated ${data.firstName} ${data.lastName}`);
            this.showToast('Student updated', 'success');
        } else {
            students.push(data);
            this.addActivity('student_added', `Added ${data.firstName} ${data.lastName}`);
            this.showToast('Student added', 'success');
        }
        this.saveData('students', students);
        this.closeModal();
        this.loadStudentsTable();
        this.updateStudentCount();
        this.populateClassFilter();
        this.loadDashboard();
    }

    // ================================================================
    // COURSE MODAL
    // ================================================================

    openCourseModal(courseId = null) {
        const modal = document.getElementById('courseModal');
        const form  = document.getElementById('courseForm');
        if (!modal || !form) return;
        form.reset();
        this.editingId = courseId;
        document.getElementById('courseModalTitle').textContent = courseId ? 'Edit Course' : 'Add New Course';

        if (courseId) {
            const c = this.getData('courses').find(x => x.id === courseId);
            if (c) {
                document.getElementById('courseCode').value        = c.code;
                document.getElementById('courseName').value        = c.name;
                document.getElementById('courseInstructor').value  = c.instructor || '';
                document.getElementById('courseCredits').value     = c.credits || 3;
                document.getElementById('courseDuration').value    = c.duration || 16;
                document.getElementById('courseSchedule').value    = c.schedule || '';
                document.getElementById('courseDescription').value = c.description || '';
                document.getElementById('courseStartDate').value   = c.startDate || '';
                document.getElementById('courseEndDate').value     = c.endDate || '';
                document.getElementById('courseStatus').value      = c.status || 'active';
            }
        } else {
            document.getElementById('courseCode').value     = `CRS${Date.now().toString().slice(-6)}`;
            document.getElementById('courseCredits').value  = 3;
            document.getElementById('courseDuration').value = 16;
            document.getElementById('courseStatus').value   = 'active';
        }
        this.openModal(modal);
    }

    saveCourse() {
        const data = {
            id: this.editingId || this.generateId(),
            code:        document.getElementById('courseCode').value.trim(),
            name:        document.getElementById('courseName').value.trim(),
            instructor:  document.getElementById('courseInstructor').value.trim(),
            credits:     parseInt(document.getElementById('courseCredits').value) || 3,
            duration:    parseInt(document.getElementById('courseDuration').value) || 16,
            schedule:    document.getElementById('courseSchedule').value.trim(),
            description: document.getElementById('courseDescription').value.trim(),
            startDate:   document.getElementById('courseStartDate').value,
            endDate:     document.getElementById('courseEndDate').value,
            status:      document.getElementById('courseStatus').value
        };
        if (!data.code || !data.name) { this.showToast('Please fill required fields', 'error'); return; }
        const courses = this.getData('courses');
        const idx = courses.findIndex(c => c.id === data.id);
        if (idx > -1) { courses[idx] = data; this.showToast('Course updated', 'success'); }
        else { courses.push(data); this.addActivity('course_added', `Added course: ${data.name}`); this.showToast('Course added', 'success'); }
        this.saveData('courses', courses);
        this.closeModal();
        this.loadCoursesGrid();
        this.populateCourseFilter();
        this.loadDashboard();
    }

    // ================================================================
    // ATTENDANCE MODAL
    // ================================================================

    openAttendanceModal(recordId = null) {
        const modal = document.getElementById('attendanceModal');
        const form  = document.getElementById('attendanceForm');
        const sel   = document.getElementById('attendanceStudent');
        if (!modal || !form || !sel) return;
        form.reset();
        this.editingId = recordId;

        const students = this.getData('students').filter(s => s.status === 'active');
        sel.innerHTML = '<option value="">Select Student</option>' +
            students.map(s => `<option value="${s.id}">${s.firstName} ${s.lastName} (${s.class})</option>`).join('');

        if (recordId) {
            const r = this.getData('attendance').find(a => a.id === recordId);
            if (r) {
                sel.value = r.studentId;
                document.getElementById('attendanceDateModal').value  = r.date;
                document.getElementById('attendanceStatus').value     = r.status;
                document.getElementById('attendanceRemarks').value    = r.remarks || '';
            }
        } else {
            document.getElementById('attendanceDateModal').value = document.getElementById('attendanceDate')?.value || this.getTodayDate();
        }
        this.openModal(modal);
    }

    saveAttendance() {
        const data = {
            id:        this.editingId || this.generateId(),
            studentId: document.getElementById('attendanceStudent').value,
            date:      document.getElementById('attendanceDateModal').value,
            status:    document.getElementById('attendanceStatus').value,
            remarks:   document.getElementById('attendanceRemarks').value.trim()
        };
        if (!data.studentId || !data.date) { this.showToast('Please fill required fields', 'error'); return; }

        const attendance = this.getData('attendance');
        const idx = attendance.findIndex(a => a.id === data.id);
        if (idx > -1) { attendance[idx] = data; this.showToast('Attendance updated', 'success'); }
        else {
            attendance.push(data);
            const s = this.getData('students').find(x => x.id === data.studentId);
            if (s) this.addActivity('attendance_marked', `Marked ${data.status} for ${s.firstName} ${s.lastName}`);
            this.showToast('Attendance recorded', 'success');
        }
        this.saveData('attendance', attendance);
        this.closeModal();
        this.loadAttendanceTable();
        this.loadAttendanceSummary();
        this.loadDashboard();
    }

    // ================================================================
    // GRADE MODAL
    // ================================================================

    openGradeModal(gradeId = null) {
        const modal = document.getElementById('gradeModal');
        const form  = document.getElementById('gradeForm');
        const sSel  = document.getElementById('gradeStudent');
        const cSel  = document.getElementById('gradeCourse');
        if (!modal || !form || !sSel || !cSel) return;
        form.reset();
        this.editingId = gradeId;
        document.getElementById('gradeModalTitle').textContent = gradeId ? 'Edit Grade' : 'Add Grade';

        sSel.innerHTML = '<option value="">Select Student</option>' +
            this.getData('students').filter(s => s.status === 'active')
                .map(s => `<option value="${s.id}">${s.firstName} ${s.lastName}</option>`).join('');
        cSel.innerHTML = '<option value="">Select Course</option>' +
            this.getData('courses').filter(c => c.status === 'active')
                .map(c => `<option value="${c.id}">${c.code} – ${c.name}</option>`).join('');

        if (gradeId) {
            const g = this.getData('grades').find(x => x.id === gradeId);
            if (g) {
                sSel.value = g.studentId;
                cSel.value = g.courseId;
                document.getElementById('gradeScore').value   = g.score;
                document.getElementById('gradeDate').value    = g.date;
                document.getElementById('gradeRemarks').value = g.remarks || '';
            }
        } else {
            document.getElementById('gradeDate').value = this.getTodayDate();
        }
        this.openModal(modal);
    }

    saveGrade() {
        const data = {
            id:        this.editingId || this.generateId(),
            studentId: document.getElementById('gradeStudent').value,
            courseId:  document.getElementById('gradeCourse').value,
            score:     parseFloat(document.getElementById('gradeScore').value),
            date:      document.getElementById('gradeDate').value,
            remarks:   document.getElementById('gradeRemarks').value.trim()
        };
        if (!data.studentId || !data.courseId || isNaN(data.score)) { this.showToast('Please fill required fields', 'error'); return; }
        if (data.score < 0 || data.score > 100) { this.showToast('Score must be 0–100', 'error'); return; }

        const grades = this.getData('grades');
        const idx = grades.findIndex(g => g.id === data.id);
        if (idx > -1) { grades[idx] = data; this.showToast('Grade updated', 'success'); }
        else {
            grades.push(data);
            const s = this.getData('students').find(x => x.id === data.studentId);
            const c = this.getData('courses').find(x => x.id === data.courseId);
            if (s && c) this.addActivity('grade_added', `${s.firstName} ${s.lastName} scored ${data.score} in ${c.name}`);
            this.showToast('Grade added', 'success');
        }
        this.saveData('grades', grades);
        this.closeModal();
        this.loadGradesTable();
        this.loadGradesSummary();
        this.loadDashboard();
    }

    // ================================================================
    // EVENT MODAL
    // ================================================================

    openEventModal() {
        const modal = document.getElementById('eventModal');
        const form  = document.getElementById('eventForm');
        if (!modal || !form) return;
        form.reset();
        document.getElementById('eventDate').value = this.getTodayDate();
        this.openModal(modal);
    }

    saveEvent() {
        const data = {
            id:          this.generateId(),
            title:       document.getElementById('eventTitle').value.trim(),
            date:        document.getElementById('eventDate').value,
            time:        document.getElementById('eventTime').value,
            type:        document.getElementById('eventType').value,
            description: document.getElementById('eventDescription').value.trim()
        };
        if (!data.title || !data.date) { this.showToast('Please fill required fields', 'error'); return; }
        const events = this.getData('events');
        events.push(data);
        this.saveData('events', events);
        this.showToast('Event added', 'success');
        this.closeModal();
        this.loadDashboard();
    }

    deleteEvent(id) {
        const events = this.getData('events').filter(e => e.id !== id);
        this.saveData('events', events);
        this.showToast('Event deleted', 'success');
        this.loadDashboard();
    }

    // ================================================================
    // DELETE
    // ================================================================

    confirmDelete(type, id) {
        const messages = {
            student:    'Delete this student? All related attendance and grade records will also be removed.',
            course:     'Delete this course? All related grade records will also be removed.',
            attendance: 'Delete this attendance record?',
            grade:      'Delete this grade record?'
        };
        document.getElementById('confirmMessage').textContent = messages[type] || 'Are you sure?';
        this.confirmCallback = () => this.deleteItem(type, id);
        this.openModal(document.getElementById('confirmModal'));
    }

    deleteItem(type, id) {
        const handlers = {
            student:    () => this.deleteStudent(id),
            course:     () => this.deleteCourse(id),
            attendance: () => this.deleteAttendance(id),
            grade:      () => this.deleteGrade(id)
        };
        handlers[type]?.();
    }

    deleteStudent(id) {
        this.saveData('students', this.getData('students').filter(s => s.id !== id));
        this.saveData('grades',   this.getData('grades').filter(g => g.studentId !== id));
        this.saveData('attendance', this.getData('attendance').filter(a => a.studentId !== id));
        this.showToast('Student deleted', 'success');
        this.loadStudentsTable(); this.updateStudentCount(); this.loadDashboard();
    }

    deleteCourse(id) {
        this.saveData('courses', this.getData('courses').filter(c => c.id !== id));
        this.saveData('grades',  this.getData('grades').filter(g => g.courseId !== id));
        this.showToast('Course deleted', 'success');
        this.loadCoursesGrid(); this.populateCourseFilter(); this.loadDashboard();
    }

    deleteAttendance(id) {
        this.saveData('attendance', this.getData('attendance').filter(a => a.id !== id));
        this.showToast('Record deleted', 'success');
        this.loadAttendanceTable(); this.loadAttendanceSummary(); this.loadDashboard();
    }

    deleteGrade(id) {
        this.saveData('grades', this.getData('grades').filter(g => g.id !== id));
        this.showToast('Grade deleted', 'success');
        this.loadGradesTable(); this.loadGradesSummary(); this.loadDashboard();
    }

    // ================================================================
    // REPORTS
    // ================================================================

    generateReport() {
        const type = document.getElementById('reportType')?.value || 'attendance';
        const c = document.getElementById('reportContent');
        if (!c) return;
        const handlers = {
            attendance: () => this.reportAttendance(),
            grades:     () => this.reportGrades(),
            students:   () => this.reportStudents(),
            courses:    () => this.reportCourses()
        };
        c.innerHTML = handlers[type]?.() || '';
    }

    reportAttendance() {
        const att = this.getData('attendance');
        if (!att.length) return `<div class="empty-state"><i class="fas fa-calendar-check"></i><h3>No attendance records</h3></div>`;

        const byDate = {};
        att.forEach(r => {
            if (!byDate[r.date]) byDate[r.date] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
            byDate[r.date][r.status]++;
            byDate[r.date].total++;
        });
        const dates = Object.keys(byDate).sort().reverse();
        const totalPresent = att.filter(r => r.status === 'present').length;
        const overallRate = ((totalPresent / att.length) * 100).toFixed(1);

        return `
            <div style="margin-bottom:1.5rem">
                <h3>Attendance Report</h3>
                <p style="color:var(--text-3);font-size:.775rem;margin-top:.25rem">Generated on ${this.formatDate(this.getTodayDate())}</p>
            </div>
            <div class="report-meta">
                <div class="report-meta-item"><span class="report-meta-label">Total Records</span><span class="report-meta-value">${att.length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Days Tracked</span><span class="report-meta-value">${dates.length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Overall Rate</span><span class="report-meta-value" style="color:var(--success)">${overallRate}%</span></div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th>Total</th><th>Rate</th></tr></thead>
                    <tbody>
                    ${dates.map(date => {
                        const d = byDate[date];
                        const rate = ((d.present / d.total) * 100).toFixed(0);
                        const color = rate >= 80 ? 'var(--success)' : rate >= 60 ? 'var(--warning)' : 'var(--danger)';
                        return `<tr>
                            <td>${this.formatDate(date)}</td>
                            <td><span class="status-badge badge-present">${d.present}</span></td>
                            <td><span class="status-badge badge-absent">${d.absent}</span></td>
                            <td><span class="status-badge badge-late">${d.late}</span></td>
                            <td><span class="status-badge badge-excused">${d.excused}</span></td>
                            <td><strong>${d.total}</strong></td>
                            <td><strong style="color:${color}">${rate}%</strong></td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    reportGrades() {
        const grades = this.getData('grades');
        if (!grades.length) return `<div class="empty-state"><i class="fas fa-chart-bar"></i><h3>No grade records</h3></div>`;

        const avg = (grades.reduce((s, g) => s + g.score, 0) / grades.length).toFixed(1);
        const max = Math.max(...grades.map(g => g.score)).toFixed(1);
        const min = Math.min(...grades.map(g => g.score)).toFixed(1);
        const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        grades.forEach(g => dist[this.calculateGrade(g.score)]++);

        return `
            <div style="margin-bottom:1.5rem">
                <h3>Grades Report</h3>
                <p style="color:var(--text-3);font-size:.775rem;margin-top:.25rem">Generated on ${this.formatDate(this.getTodayDate())}</p>
            </div>
            <div class="report-meta">
                <div class="report-meta-item"><span class="report-meta-label">Total Grades</span><span class="report-meta-value">${grades.length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Average</span><span class="report-meta-value">${avg}%</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Highest</span><span class="report-meta-value" style="color:var(--success)">${max}%</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Lowest</span><span class="report-meta-value" style="color:var(--danger)">${min}%</span></div>
            </div>
            <h4>Grade Distribution</h4>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Grade</th><th>Count</th><th>Percentage</th><th>Bar</th></tr></thead>
                    <tbody>
                    ${Object.entries(dist).map(([g, count]) => {
                        const pct = ((count / grades.length) * 100).toFixed(1);
                        const color = this.getGradeColor(g);
                        return `<tr>
                            <td><span class="grade-badge grade-${g}">${g}</span></td>
                            <td><strong>${count}</strong></td>
                            <td>${pct}%</td>
                            <td style="min-width:100px">
                                <div style="background:var(--bg);border-radius:9999px;height:8px;overflow:hidden">
                                    <div style="width:${pct}%;background:${color};height:100%;border-radius:9999px;transition:width .5s"></div>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    reportStudents() {
        const students = this.getData('students');
        if (!students.length) return `<div class="empty-state"><i class="fas fa-user-graduate"></i><h3>No student records</h3></div>`;

        const byClass = {};
        students.forEach(s => {
            if (!byClass[s.class]) byClass[s.class] = { total: 0, active: 0, inactive: 0 };
            byClass[s.class].total++;
            byClass[s.class][s.status]++;
        });
        const genders = {};
        students.forEach(s => { if (s.gender) { genders[s.gender] = (genders[s.gender] || 0) + 1; } });

        return `
            <div style="margin-bottom:1.5rem">
                <h3>Student Report</h3>
                <p style="color:var(--text-3);font-size:.775rem;margin-top:.25rem">Generated on ${this.formatDate(this.getTodayDate())}</p>
            </div>
            <div class="report-meta">
                <div class="report-meta-item"><span class="report-meta-label">Total</span><span class="report-meta-value">${students.length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Active</span><span class="report-meta-value" style="color:var(--success)">${students.filter(s => s.status === 'active').length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Inactive</span><span class="report-meta-value" style="color:var(--danger)">${students.filter(s => s.status === 'inactive').length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Classes</span><span class="report-meta-value">${Object.keys(byClass).length}</span></div>
            </div>
            <h4>Enrollment by Class</h4>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Class</th><th>Total</th><th>Active</th><th>Inactive</th></tr></thead>
                    <tbody>
                    ${Object.entries(byClass).sort(([a], [b]) => a.localeCompare(b)).map(([cls, d]) => `
                        <tr>
                            <td><strong>${cls}</strong></td>
                            <td>${d.total}</td>
                            <td><span class="status-badge badge-active">${d.active}</span></td>
                            <td><span class="status-badge badge-inactive">${d.inactive}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    reportCourses() {
        const courses = this.getData('courses');
        const grades  = this.getData('grades');
        if (!courses.length) return `<div class="empty-state"><i class="fas fa-book-open"></i><h3>No course records</h3></div>`;

        return `
            <div style="margin-bottom:1.5rem">
                <h3>Course Report</h3>
                <p style="color:var(--text-3);font-size:.775rem;margin-top:.25rem">Generated on ${this.formatDate(this.getTodayDate())}</p>
            </div>
            <div class="report-meta">
                <div class="report-meta-item"><span class="report-meta-label">Total</span><span class="report-meta-value">${courses.length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Active</span><span class="report-meta-value" style="color:var(--success)">${courses.filter(c => c.status === 'active').length}</span></div>
                <div class="report-meta-item"><span class="report-meta-label">Completed</span><span class="report-meta-value" style="color:var(--info)">${courses.filter(c => c.status === 'completed').length}</span></div>
            </div>
            <div class="table-responsive">
                <table class="data-table">
                    <thead><tr><th>Code</th><th>Course</th><th>Instructor</th><th>Credits</th><th>Status</th><th>Grades</th><th>Avg Score</th></tr></thead>
                    <tbody>
                    ${courses.map(c => {
                        const cg = grades.filter(g => g.courseId === c.id);
                        const avg = cg.length ? (cg.reduce((s, g) => s + g.score, 0) / cg.length).toFixed(1) + '%' : '—';
                        return `<tr>
                            <td><span class="course-code">${this.escapeHtml(c.code)}</span></td>
                            <td><strong>${this.escapeHtml(c.name)}</strong></td>
                            <td>${c.instructor ? this.escapeHtml(c.instructor) : '<span style="color:var(--text-3)">—</span>'}</td>
                            <td>${c.credits}</td>
                            <td><span class="course-status status-${c.status}">${c.status}</span></td>
                            <td>${cg.length}</td>
                            <td><strong>${avg}</strong></td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    printReport() { window.print(); }

    // ================================================================
    // IMPORT / EXPORT
    // ================================================================

    exportData() {
        const data = {
            students: this.getData('students'),
            courses:  this.getData('courses'),
            attendance: this.getData('attendance'),
            grades:   this.getData('grades'),
            events:   this.getData('events'),
            activities: this.getData('activities'),
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `edumgr-backup-${this.getTodayDate()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('Data exported', 'success');
    }

    importData(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.students || !Array.isArray(data.students)) throw new Error('Invalid format');
                if (!confirm('This will replace all existing data. Continue?')) return;
                ['students', 'courses', 'attendance', 'grades', 'events', 'activities'].forEach(key => {
                    if (data[key]) this.saveData(key, data[key]);
                });
                this.showToast('Data imported successfully', 'success');
                this.loadView(this.currentView);
            } catch {
                this.showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
        // reset input
        document.getElementById('importFile').value = '';
    }

    // ================================================================
    // THEME
    // ================================================================

    checkTheme() { this.setTheme(localStorage.getItem('theme') || 'light'); }

    toggleTheme() {
        this.setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
    }

    setTheme(theme) {
        const btn = document.getElementById('themeToggle');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    }

    // ================================================================
    // TOAST
    // ================================================================

    showToast(message, type = 'info') {
        const toast   = document.getElementById('toast');
        const icon    = toast?.querySelector('.toast-icon');
        const msg     = toast?.querySelector('.toast-message');
        if (!toast || !icon || !msg) return;

        const icons = {
            success: 'fas fa-circle-check',
            error:   'fas fa-circle-xmark',
            warning: 'fas fa-triangle-exclamation',
            info:    'fas fa-circle-info'
        };
        icon.className = `toast-icon ${icons[type] || icons.info}`;
        msg.textContent = message;
        toast.className = `toast ${type} show`;

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
    }
}

// ================================================================
// Bootstrap
// ================================================================
let studentSystem;
document.addEventListener('DOMContentLoaded', () => {
    studentSystem = new StudentManagementSystem();
});
