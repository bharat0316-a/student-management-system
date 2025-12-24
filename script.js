// Student Management System - Main Application
class StudentManagementSystem {
    constructor() {
        this.currentView = 'dashboard';
        this.currentModal = null;
        this.confirmCallback = null;
        
        // Initialize flatpickr for date inputs
        this.initDatePickers();
        
        // Initialize Chart.js
        this.gradesChart = null;
        
        // Initialize the application
        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial view
        this.loadView('dashboard');
        
        // Set default date for attendance
        document.getElementById('attendanceDate').value = this.getTodayDate();
        
        // Check and set theme
        this.checkTheme();
    }

    // Data Management
    loadData() {
        // Initialize empty data structures if not exists
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('courses')) {
            localStorage.setItem('courses', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('grades')) {
            localStorage.setItem('grades', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('events')) {
            localStorage.setItem('events', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('activities')) {
            localStorage.setItem('activities', JSON.stringify([]));
        }
    }

    getStudents() {
        return JSON.parse(localStorage.getItem('students')) || [];
    }

    getCourses() {
        return JSON.parse(localStorage.getItem('courses')) || [];
    }

    getAttendance() {
        return JSON.parse(localStorage.getItem('attendance')) || [];
    }

    getGrades() {
        return JSON.parse(localStorage.getItem('grades')) || [];
    }

    getEvents() {
        return JSON.parse(localStorage.getItem('events')) || [];
    }

    getActivities() {
        return JSON.parse(localStorage.getItem('activities')) || [];
    }

    saveStudents(students) {
        localStorage.setItem('students', JSON.stringify(students));
    }

    saveCourses(courses) {
        localStorage.setItem('courses', JSON.stringify(courses));
    }

    saveAttendance(attendance) {
        localStorage.setItem('attendance', JSON.stringify(attendance));
    }

    saveGrades(grades) {
        localStorage.setItem('grades', JSON.stringify(grades));
    }

    saveEvents(events) {
        localStorage.setItem('events', JSON.stringify(events));
    }

    saveActivities(activities) {
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    addActivity(type, description, data = {}) {
        const activities = this.getActivities();
        const activity = {
            id: this.generateId(),
            type,
            description,
            data,
            timestamp: new Date().toISOString(),
            date: this.getTodayDate()
        };
        
        activities.unshift(activity);
        if (activities.length > 50) activities.pop(); // Keep last 50 activities
        
        this.saveActivities(activities);
        return activity;
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calculateAge(dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    calculateGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    calculateGPA(grades) {
        if (grades.length === 0) return 0;
        
        const gradePoints = {
            'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
        };
        
        const total = grades.reduce((sum, grade) => {
            return sum + (gradePoints[grade.grade] || 0);
        }, 0);
        
        return (total / grades.length).toFixed(2);
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.loadView(view);
                
                // Update active state
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Modal Close Buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Modal Background Close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });

        // Student Form
        document.getElementById('studentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });

        // Course Form
        document.getElementById('courseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCourse();
        });

        // Attendance Form
        document.getElementById('attendanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAttendanceRecord();
        });

        // Grade Form
        document.getElementById('gradeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGrade();
        });

        // Event Form
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });

        // Action Buttons
        document.getElementById('addStudentBtn').addEventListener('click', () => {
            this.openStudentModal();
        });

        document.getElementById('newStudentBtn').addEventListener('click', () => {
            this.openStudentModal();
        });

        document.getElementById('addCourseBtn').addEventListener('click', () => {
            this.openCourseModal();
        });

        document.getElementById('newCourseBtn').addEventListener('click', () => {
            this.openCourseModal();
        });

        document.getElementById('markAttendanceBtn').addEventListener('click', () => {
            this.openAttendanceModal();
        });

        document.getElementById('addGradeBtn').addEventListener('click', () => {
            this.openGradeModal();
        });

        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openEventModal();
        });

        // Search and Filters
        document.getElementById('studentSearch').addEventListener('input', (e) => {
            this.filterStudents(e.target.value);
        });

        document.getElementById('studentFilterClass').addEventListener('change', () => {
            this.filterStudents();
        });

        document.getElementById('studentFilterStatus').addEventListener('change', () => {
            this.filterStudents();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Reports
        document.getElementById('generateReportBtn').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('printReportBtn').addEventListener('click', () => {
            this.printReport();
        });

        // Attendance Date Change
        document.getElementById('attendanceDate').addEventListener('change', () => {
            this.loadAttendanceTable();
        });

        // Grade Course Filter
        document.getElementById('gradeCourseFilter').addEventListener('change', () => {
            this.loadGradesTable();
            this.updateGradesChart();
        });
    }

    // View Management
    loadView(view) {
        this.currentView = view;
        
        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Show current view
        document.getElementById(`${view}View`).classList.add('active');
        
        // Load view data
        switch(view) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'students':
                this.loadStudentsTable();
                this.populateClassFilter();
                break;
            case 'courses':
                this.loadCoursesGrid();
                break;
            case 'attendance':
                this.loadAttendanceTable();
                break;
            case 'grades':
                this.loadGradesTable();
                this.populateCourseFilter();
                this.updateGradesChart();
                break;
            case 'reports':
                this.generateReport();
                break;
        }
    }

    // Dashboard Functions
    loadDashboard() {
        const students = this.getStudents();
        const courses = this.getCourses();
        const attendance = this.getAttendance();
        const grades = this.getGrades();
        const activities = this.getActivities();
        const events = this.getEvents();

        // Update stats
        document.getElementById('totalStudents').textContent = students.length;
        document.getElementById('totalCourses').textContent = courses.length;
        
        // Calculate attendance rate
        const todayAttendance = attendance.filter(a => a.date === this.getTodayDate());
        const todayPresent = todayAttendance.filter(a => a.status === 'present').length;
        const attendanceRate = todayAttendance.length > 0 ? 
            Math.round((todayPresent / todayAttendance.length) * 100) : 0;
        document.getElementById('attendanceRate').textContent = `${attendanceRate}%`;
        
        // Calculate average grade
        const avgGrade = grades.length > 0 ? 
            (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : '0.0';
        document.getElementById('avgGrade').textContent = avgGrade;

        // Load recent activities
        this.loadRecentActivities(activities.slice(0, 5));

        // Load top students
        this.loadTopStudents(students, grades);

        // Load upcoming events
        this.loadUpcomingEvents(events);
    }

    loadRecentActivities(activities) {
        const container = document.getElementById('recentActivity');
        container.innerHTML = '';

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activities</p>
                </div>
            `;
            return;
        }

        activities.forEach(activity => {
            const iconColors = {
                'student_added': '#3b82f6',
                'student_updated': '#8b5cf6',
                'course_added': '#10b981',
                'attendance_marked': '#f59e0b',
                'grade_added': '#ef4444'
            };

            const icons = {
                'student_added': 'fa-user-plus',
                'student_updated': 'fa-user-edit',
                'course_added': 'fa-book-medical',
                'attendance_marked': 'fa-calendar-check',
                'grade_added': 'fa-chart-line'
            };

            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon" style="background: ${iconColors[activity.type] || '#6b7280'}">
                    <i class="fas ${icons[activity.type] || 'fa-bell'}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-title">${activity.description}</div>
                    <div class="activity-time">${this.formatDateTime(activity.timestamp)}</div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    loadTopStudents(students, grades) {
        const container = document.getElementById('topStudents');
        container.innerHTML = '';

        // Calculate student averages
        const studentAverages = {};
        grades.forEach(grade => {
            if (!studentAverages[grade.studentId]) {
                studentAverages[grade.studentId] = { total: 0, count: 0 };
            }
            studentAverages[grade.studentId].total += grade.score;
            studentAverages[grade.studentId].count++;
        });

        // Get top 5 students
        const topStudents = students
            .map(student => {
                const avg = studentAverages[student.id] ? 
                    studentAverages[student.id].total / studentAverages[student.id].count : 0;
                return { ...student, average: avg };
            })
            .sort((a, b) => b.average - a.average)
            .slice(0, 5);

        if (topStudents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-trophy"></i>
                    <p>No grades recorded yet</p>
                </div>
            `;
            return;
        }

        topStudents.forEach((student, index) => {
            const rankColors = ['#f59e0b', '#6b7280', '#8b5cf6', '#10b981', '#3b82f6'];
            const item = document.createElement('div');
            item.className = 'student-item';
            item.innerHTML = `
                <div class="student-avatar" style="background: ${rankColors[index] || '#6b7280'}">
                    ${student.firstName[0]}${student.lastName[0]}
                </div>
                <div class="student-info">
                    <div class="student-name">${student.firstName} ${student.lastName}</div>
                    <div class="student-grade">Class: ${student.class}</div>
                </div>
                <div class="student-rank">${student.average.toFixed(1)}%</div>
            `;
            container.appendChild(item);
        });
    }

    loadUpcomingEvents(events) {
        const container = document.getElementById('upcomingEvents');
        container.innerHTML = '';

        // Filter upcoming events (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        if (upcomingEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-day"></i>
                    <p>No upcoming events</p>
                </div>
            `;
            return;
        }

        upcomingEvents.forEach(event => {
            const typeColors = {
                'exam': '#ef4444',
                'holiday': '#10b981',
                'meeting': '#3b82f6',
                'activity': '#8b5cf6',
                'other': '#6b7280'
            };

            const item = document.createElement('div');
            item.className = 'event-item';
            item.innerHTML = `
                <div class="event-icon" style="background: ${typeColors[event.type] || '#6b7280'}">
                    <i class="fas ${event.type === 'exam' ? 'fa-file-alt' : 
                                  event.type === 'holiday' ? 'fa-umbrella-beach' :
                                  event.type === 'meeting' ? 'fa-users' :
                                  event.type === 'activity' ? 'fa-running' : 'fa-calendar'}"></i>
                </div>
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${this.formatDate(event.date)} ${event.time || ''}</div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // Students Management
    loadStudentsTable() {
        const students = this.getStudents();
        const container = document.getElementById('studentsTable');
        container.innerHTML = '';

        if (students.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No Students Found</h3>
                        <p>Add your first student to get started</p>
                        <button id="addFirstStudent" class="btn-primary">Add Student</button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addFirstStudent')?.addEventListener('click', () => {
                this.openStudentModal();
            });
            
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>
                    <strong>${student.firstName} ${student.lastName}</strong>
                    <div class="text-light">${student.email}</div>
                </td>
                <td>${student.email}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.class} ${student.section ? `- ${student.section}` : ''}</td>
                <td>
                    <span class="status-badge badge-${student.status}">
                        ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                </td>
                <td>${this.formatDate(student.enrollmentDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${student.id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${student.id}" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="action-btn view" data-id="${student.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });

        // Add event listeners to action buttons
        container.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const studentId = btn.dataset.id;
                this.openStudentModal(studentId);
            });
        });

        container.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const studentId = btn.dataset.id;
                this.confirmDelete('student', studentId);
            });
        });

        container.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const studentId = btn.dataset.id;
                this.viewStudentDetails(studentId);
            });
        });
    }

    filterStudents(searchTerm = '') {
        const classFilter = document.getElementById('studentFilterClass').value;
        const statusFilter = document.getElementById('studentFilterStatus').value;
        
        const students = this.getStudents();
        const filtered = students.filter(student => {
            const matchesSearch = searchTerm === '' || 
                student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesClass = !classFilter || student.class === classFilter;
            const matchesStatus = !statusFilter || student.status === statusFilter;
            
            return matchesSearch && matchesClass && matchesStatus;
        });

        this.displayFilteredStudents(filtered);
    }

    displayFilteredStudents(students) {
        const container = document.getElementById('studentsTable');
        
        if (students.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No Students Found</h3>
                        <p>Try adjusting your search or filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = '';
        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.class}</td>
                <td>
                    <span class="status-badge badge-${student.status}">
                        ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                </td>
                <td>${this.formatDate(student.enrollmentDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
    }

    clearFilters() {
        document.getElementById('studentSearch').value = '';
        document.getElementById('studentFilterClass').value = '';
        document.getElementById('studentFilterStatus').value = '';
        this.loadStudentsTable();
    }

    populateClassFilter() {
        const students = this.getStudents();
        const classes = [...new Set(students.map(s => s.class))].sort();
        const filter = document.getElementById('studentFilterClass');
        
        // Clear existing options except first
        while (filter.options.length > 1) {
            filter.remove(1);
        }
        
        // Add class options
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            filter.appendChild(option);
        });
    }

    // Courses Management
    loadCoursesGrid() {
        const courses = this.getCourses();
        const container = document.getElementById('coursesGrid');
        container.innerHTML = '';

        if (courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>No Courses Found</h3>
                    <p>Add your first course to get started</p>
                    <button id="addFirstCourse" class="btn-primary">Add Course</button>
                </div>
            `;
            
            document.getElementById('addFirstCourse')?.addEventListener('click', () => {
                this.openCourseModal();
            });
            
            return;
        }

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="course-header">
                    <span class="course-code">${course.code}</span>
                    <span class="course-status status-${course.status}">
                        ${course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                </div>
                <h3 class="course-title">${course.name}</h3>
                <div class="course-info">
                    <div class="course-info-item">
                        <i class="fas fa-chalkboard-teacher"></i>
                        <span>${course.instructor || 'Not assigned'}</span>
                    </div>
                    <div class="course-info-item">
                        <i class="fas fa-award"></i>
                        <span>${course.credits || 3} Credits</span>
                    </div>
                    <div class="course-info-item">
                        <i class="fas fa-clock"></i>
                        <span>${course.duration || 16} weeks</span>
                    </div>
                    <div class="course-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${course.schedule || 'Schedule not set'}</span>
                    </div>
                </div>
                <p class="course-description">${course.description || 'No description provided.'}</p>
                <div class="course-actions">
                    <button class="btn-secondary btn-sm edit-course" data-id="${course.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-danger btn-sm delete-course" data-id="${course.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        container.querySelectorAll('.edit-course').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.id;
                this.openCourseModal(courseId);
            });
        });

        container.querySelectorAll('.delete-course').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.id;
                this.confirmDelete('course', courseId);
            });
        });
    }

    // Attendance Management
    loadAttendanceTable() {
        const date = document.getElementById('attendanceDate').value;
        const attendance = this.getAttendance().filter(a => a.date === date);
        const container = document.getElementById('attendanceTable');
        container.innerHTML = '';

        if (attendance.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <i class="fas fa-calendar-check"></i>
                        <h3>No Attendance Records</h3>
                        <p>No attendance marked for ${this.formatDate(date)}</p>
                        <button id="markFirstAttendance" class="btn-primary">Mark Attendance</button>
                    </td>
                </tr>
            `;
            
            document.getElementById('markFirstAttendance')?.addEventListener('click', () => {
                this.openAttendanceModal();
            });
            
            return;
        }

        const students = this.getStudents();
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s);

        attendance.forEach(record => {
            const student = studentMap[record.studentId];
            if (!student) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.class}</td>
                <td>
                    <span class="status-badge badge-${record.status}">
                        ${record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                </td>
                <td>${this.formatDate(record.date)}</td>
                <td>${record.remarks || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${record.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${record.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });

        // Add event listeners
        container.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const recordId = btn.dataset.id;
                this.openAttendanceModal(recordId);
            });
        });

        container.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const recordId = btn.dataset.id;
                this.confirmDelete('attendance', recordId);
            });
        });
    }

    // Grades Management
    loadGradesTable() {
        const courseFilter = document.getElementById('gradeCourseFilter').value;
        const grades = courseFilter ? 
            this.getGrades().filter(g => g.courseId === courseFilter) : 
            this.getGrades();
        
        const container = document.getElementById('gradesTable');
        container.innerHTML = '';

        if (grades.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-chart-line"></i>
                        <h3>No Grades Recorded</h3>
                        <p>Add your first grade to get started</p>
                        <button id="addFirstGrade" class="btn-primary">Add Grade</button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addFirstGrade')?.addEventListener('click', () => {
                this.openGradeModal();
            });
            
            return;
        }

        const students = this.getStudents();
        const courses = this.getCourses();
        const studentMap = {};
        const courseMap = {};
        
        students.forEach(s => studentMap[s.id] = s);
        courses.forEach(c => courseMap[c.id] = c);

        grades.forEach(grade => {
            const student = studentMap[grade.studentId];
            const course = courseMap[grade.courseId];
            
            if (!student || !course) return;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.firstName} ${student.lastName}</td>
                <td>${course.name} (${course.code})</td>
                <td>
                    <strong>${this.calculateGrade(grade.score)}</strong>
                    <div class="text-light">${grade.score.toFixed(1)}/100</div>
                </td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${grade.score}%"></div>
                    </div>
                    <span>${grade.score.toFixed(1)}%</span>
                </td>
                <td>${this.formatDate(grade.date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" data-id="${grade.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${grade.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });

        // Add event listeners
        container.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const gradeId = btn.dataset.id;
                this.openGradeModal(gradeId);
            });
        });

        container.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const gradeId = btn.dataset.id;
                this.confirmDelete('grade', gradeId);
            });
        });
    }

    updateGradesChart() {
        const courseFilter = document.getElementById('gradeCourseFilter').value;
        const grades = courseFilter ? 
            this.getGrades().filter(g => g.courseId === courseFilter) : 
            this.getGrades();
        
        const gradeDistribution = {
            'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
        };

        grades.forEach(grade => {
            const letterGrade = this.calculateGrade(grade.score);
            gradeDistribution[letterGrade]++;
        });

        const ctx = document.getElementById('gradesChart').getContext('2d');
        
        // Destroy previous chart if exists
        if (this.gradesChart) {
            this.gradesChart.destroy();
        }

        this.gradesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['A', 'B', 'C', 'D', 'F'],
                datasets: [{
                    label: 'Number of Students',
                    data: [
                        gradeDistribution['A'],
                        gradeDistribution['B'],
                        gradeDistribution['C'],
                        gradeDistribution['D'],
                        gradeDistribution['F']
                    ],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#6b7280'
                    ],
                    borderColor: [
                        '#0da271',
                        '#2563eb',
                        '#d97706',
                        '#dc2626',
                        '#4b5563'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    populateCourseFilter() {
        const courses = this.getCourses();
        const filter = document.getElementById('gradeCourseFilter');
        
        // Clear existing options except first
        while (filter.options.length > 1) {
            filter.remove(1);
        }
        
        // Add course options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            filter.appendChild(option);
        });
    }

    // Form Handling
    openStudentModal(studentId = null) {
        const modal = document.getElementById('studentModal');
        const title = document.getElementById('studentModalTitle');
        const form = document.getElementById('studentForm');
        
        if (studentId) {
            // Edit mode
            title.textContent = 'Edit Student';
            const student = this.getStudents().find(s => s.id === studentId);
            if (student) {
                this.fillStudentForm(student);
            }
        } else {
            // Add mode
            title.textContent = 'Add New Student';
            this.resetStudentForm();
            document.getElementById('studentId').value = `STU${Date.now().toString().slice(-6)}`;
            document.getElementById('enrollmentDate').value = this.getTodayDate();
        }
        
        this.openModal(modal);
    }

    fillStudentForm(student) {
        document.getElementById('studentId').value = student.id;
        document.getElementById('firstName').value = student.firstName;
        document.getElementById('lastName').value = student.lastName;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('dob').value = student.dob || '';
        document.getElementById('gender').value = student.gender || '';
        document.getElementById('class').value = student.class;
        document.getElementById('section').value = student.section || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('enrollmentDate').value = student.enrollmentDate;
        document.getElementById('status').value = student.status;
        document.getElementById('notes').value = student.notes || '';
    }

    resetStudentForm() {
        document.getElementById('studentForm').reset();
    }

    saveStudent() {
        const student = {
            id: document.getElementById('studentId').value,
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            class: document.getElementById('class').value.trim(),
            section: document.getElementById('section').value.trim(),
            address: document.getElementById('address').value.trim(),
            enrollmentDate: document.getElementById('enrollmentDate').value,
            status: document.getElementById('status').value,
            notes: document.getElementById('notes').value.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validation
        if (!student.firstName || !student.lastName || !student.email || !student.class) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        let students = this.getStudents();
        const existingIndex = students.findIndex(s => s.id === student.id);
        
        if (existingIndex > -1) {
            // Update existing student
            students[existingIndex] = { ...students[existingIndex], ...student };
            this.addActivity('student_updated', `Updated student: ${student.firstName} ${student.lastName}`);
            this.showToast('Student updated successfully', 'success');
        } else {
            // Add new student
            students.push(student);
            this.addActivity('student_added', `Added new student: ${student.firstName} ${student.lastName}`);
            this.showToast('Student added successfully', 'success');
        }

        this.saveStudents(students);
        this.closeModal();
        
        // Refresh views
        this.loadStudentsTable();
        this.loadDashboard();
        this.populateClassFilter();
    }

    openCourseModal(courseId = null) {
        const modal = document.getElementById('courseModal');
        const title = document.getElementById('courseModalTitle');
        
        if (courseId) {
            // Edit mode
            title.textContent = 'Edit Course';
            const course = this.getCourses().find(c => c.id === courseId);
            if (course) {
                this.fillCourseForm(course);
            }
        } else {
            // Add mode
            title.textContent = 'Add New Course';
            this.resetCourseForm();
            document.getElementById('courseCode').value = `CRS${Date.now().toString().slice(-6)}`;
            document.getElementById('courseStartDate').value = this.getTodayDate();
        }
        
        this.openModal(modal);
    }

    fillCourseForm(course) {
        document.getElementById('courseCode').value = course.code;
        document.getElementById('courseName').value = course.name;
        document.getElementById('courseInstructor').value = course.instructor || '';
        document.getElementById('courseCredits').value = course.credits || 3;
        document.getElementById('courseDuration').value = course.duration || 16;
        document.getElementById('courseSchedule').value = course.schedule || '';
        document.getElementById('courseDescription').value = course.description || '';
        document.getElementById('courseStartDate').value = course.startDate || '';
        document.getElementById('courseEndDate').value = course.endDate || '';
        document.getElementById('courseStatus').value = course.status || 'active';
    }

    resetCourseForm() {
        document.getElementById('courseForm').reset();
    }

    saveCourse() {
        const course = {
            id: this.generateId(),
            code: document.getElementById('courseCode').value.trim(),
            name: document.getElementById('courseName').value.trim(),
            instructor: document.getElementById('courseInstructor').value.trim(),
            credits: parseInt(document.getElementById('courseCredits').value) || 3,
            duration: parseInt(document.getElementById('courseDuration').value) || 16,
            schedule: document.getElementById('courseSchedule').value.trim(),
            description: document.getElementById('courseDescription').value.trim(),
            startDate: document.getElementById('courseStartDate').value,
            endDate: document.getElementById('courseEndDate').value,
            status: document.getElementById('courseStatus').value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validation
        if (!course.code || !course.name) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        let courses = this.getCourses();
        const existingIndex = courses.findIndex(c => c.id === course.id);
        
        if (existingIndex > -1) {
            // Update existing course
            courses[existingIndex] = { ...courses[existingIndex], ...course };
            this.addActivity('course_updated', `Updated course: ${course.name}`);
            this.showToast('Course updated successfully', 'success');
        } else {
            // Add new course
            courses.push(course);
            this.addActivity('course_added', `Added new course: ${course.name}`);
            this.showToast('Course added successfully', 'success');
        }

        this.saveCourses(courses);
        this.closeModal();
        
        // Refresh views
        this.loadCoursesGrid();
        this.loadDashboard();
        this.populateCourseFilter();
    }

    openAttendanceModal(recordId = null) {
        const modal = document.getElementById('attendanceModal');
        const studentSelect = document.getElementById('attendanceStudent');
        
        // Populate student dropdown
        this.populateStudentDropdown(studentSelect);
        
        if (recordId) {
            // Edit mode
            const record = this.getAttendance().find(a => a.id === recordId);
            if (record) {
                document.getElementById('attendanceStudent').value = record.studentId;
                document.getElementById('attendanceDateModal').value = record.date;
                document.getElementById('attendanceStatus').value = record.status;
                document.getElementById('attendanceRemarks').value = record.remarks || '';
            }
        } else {
            // Add mode
            document.getElementById('attendanceForm').reset();
            document.getElementById('attendanceDateModal').value = this.getTodayDate();
        }
        
        this.openModal(modal);
    }

    populateStudentDropdown(selectElement) {
        const students = this.getStudents().filter(s => s.status === 'active');
        selectElement.innerHTML = '<option value="">Select Student</option>';
        
        students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.firstName} ${student.lastName} (${student.class})`;
            selectElement.appendChild(option);
        });
    }

    saveAttendanceRecord() {
        const record = {
            id: this.generateId(),
            studentId: document.getElementById('attendanceStudent').value,
            date: document.getElementById('attendanceDateModal').value,
            status: document.getElementById('attendanceStatus').value,
            remarks: document.getElementById('attendanceRemarks').value.trim(),
            recordedAt: new Date().toISOString()
        };

        // Validation
        if (!record.studentId || !record.date || !record.status) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        let attendance = this.getAttendance();
        attendance.push(record);
        this.saveAttendance(attendance);
        
        // Add activity
        const student = this.getStudents().find(s => s.id === record.studentId);
        if (student) {
            this.addActivity('attendance_marked', 
                `Marked ${record.status} for ${student.firstName} ${student.lastName}`);
        }
        
        this.showToast('Attendance recorded successfully', 'success');
        this.closeModal();
        
        // Refresh views
        this.loadAttendanceTable();
        this.loadDashboard();
    }

    openGradeModal(gradeId = null) {
        const modal = document.getElementById('gradeModal');
        const studentSelect = document.getElementById('gradeStudent');
        const courseSelect = document.getElementById('gradeCourse');
        
        // Populate dropdowns
        this.populateStudentDropdown(studentSelect);
        this.populateGradeCourseDropdown(courseSelect);
        
        if (gradeId) {
            // Edit mode
            const grade = this.getGrades().find(g => g.id === gradeId);
            if (grade) {
                document.getElementById('gradeStudent').value = grade.studentId;
                document.getElementById('gradeCourse').value = grade.courseId;
                document.getElementById('gradeScore').value = grade.score;
                document.getElementById('gradeDate').value = grade.date;
                document.getElementById('gradeRemarks').value = grade.remarks || '';
            }
        } else {
            // Add mode
            document.getElementById('gradeForm').reset();
            document.getElementById('gradeDate').value = this.getTodayDate();
        }
        
        this.openModal(modal);
    }

    populateGradeCourseDropdown(selectElement) {
        const courses = this.getCourses().filter(c => c.status === 'active');
        selectElement.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            selectElement.appendChild(option);
        });
    }

    saveGrade() {
        const grade = {
            id: this.generateId(),
            studentId: document.getElementById('gradeStudent').value,
            courseId: document.getElementById('gradeCourse').value,
            score: parseFloat(document.getElementById('gradeScore').value),
            date: document.getElementById('gradeDate').value,
            remarks: document.getElementById('gradeRemarks').value.trim(),
            grade: this.calculateGrade(parseFloat(document.getElementById('gradeScore').value)),
            recordedAt: new Date().toISOString()
        };

        // Validation
        if (!grade.studentId || !grade.courseId || isNaN(grade.score) || grade.score < 0 || grade.score > 100) {
            this.showToast('Please enter valid grade information', 'error');
            return;
        }

        let grades = this.getGrades();
        grades.push(grade);
        this.saveGrades(grades);
        
        // Add activity
        const student = this.getStudents().find(s => s.id === grade.studentId);
        const course = this.getCourses().find(c => c.id === grade.courseId);
        if (student && course) {
            this.addActivity('grade_added', 
                `Added grade ${grade.score} for ${student.firstName} ${student.lastName} in ${course.name}`);
        }
        
        this.showToast('Grade saved successfully', 'success');
        this.closeModal();
        
        // Refresh views
        this.loadGradesTable();
        this.updateGradesChart();
        this.loadDashboard();
    }

    openEventModal(eventId = null) {
        const modal = document.getElementById('eventModal');
        
        if (eventId) {
            // Edit mode (not implemented in this version)
            document.getElementById('eventForm').reset();
        } else {
            // Add mode
            document.getElementById('eventForm').reset();
            document.getElementById('eventDate').value = this.getTodayDate();
        }
        
        this.openModal(modal);
    }

    saveEvent() {
        const event = {
            id: this.generateId(),
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            type: document.getElementById('eventType').value,
            description: document.getElementById('eventDescription').value.trim(),
            createdAt: new Date().toISOString()
        };

        // Validation
        if (!event.title || !event.date) {
            this.showToast('Please fill all required fields', 'error');
            return;
        }

        let events = this.getEvents();
        events.push(event);
        this.saveEvents(events);
        
        this.showToast('Event added successfully', 'success');
        this.closeModal();
        
        // Refresh views
        this.loadUpcomingEvents(events);
        this.loadDashboard();
    }

    // Delete Operations
    confirmDelete(type, id) {
        this.currentModal = 'confirm';
        this.confirmCallback = () => this.deleteItem(type, id);
        
        let message = '';
        switch(type) {
            case 'student':
                message = 'Are you sure you want to delete this student? This action cannot be undone.';
                break;
            case 'course':
                message = 'Are you sure you want to delete this course? All related grades will also be deleted.';
                break;
            case 'attendance':
                message = 'Are you sure you want to delete this attendance record?';
                break;
            case 'grade':
                message = 'Are you sure you want to delete this grade?';
                break;
        }
        
        document.getElementById('confirmMessage').textContent = message;
        this.openModal(document.getElementById('confirmModal'));
        
        document.getElementById('confirmAction').onclick = () => {
            this.confirmCallback();
            this.closeModal();
        };
    }

    deleteItem(type, id) {
        switch(type) {
            case 'student':
                this.deleteStudent(id);
                break;
            case 'course':
                this.deleteCourse(id);
                break;
            case 'attendance':
                this.deleteAttendance(id);
                break;
            case 'grade':
                this.deleteGrade(id);
                break;
        }
    }

    deleteStudent(id) {
        let students = this.getStudents();
        const student = students.find(s => s.id === id);
        students = students.filter(s => s.id !== id);
        this.saveStudents(students);
        
        // Also delete related grades and attendance
        let grades = this.getGrades();
        grades = grades.filter(g => g.studentId !== id);
        this.saveGrades(grades);
        
        let attendance = this.getAttendance();
        attendance = attendance.filter(a => a.studentId !== id);
        this.saveAttendance(attendance);
        
        if (student) {
            this.addActivity('student_deleted', `Deleted student: ${student.firstName} ${student.lastName}`);
        }
        
        this.showToast('Student deleted successfully', 'success');
        this.loadStudentsTable();
        this.loadDashboard();
    }

    deleteCourse(id) {
        let courses = this.getCourses();
        const course = courses.find(c => c.id === id);
        courses = courses.filter(c => c.id !== id);
        this.saveCourses(courses);
        
        // Also delete related grades
        let grades = this.getGrades();
        grades = grades.filter(g => g.courseId !== id);
        this.saveGrades(grades);
        
        if (course) {
            this.addActivity('course_deleted', `Deleted course: ${course.name}`);
        }
        
        this.showToast('Course deleted successfully', 'success');
        this.loadCoursesGrid();
        this.loadDashboard();
        this.populateCourseFilter();
    }

    deleteAttendance(id) {
        let attendance = this.getAttendance();
        attendance = attendance.filter(a => a.id !== id);
        this.saveAttendance(attendance);
        
        this.showToast('Attendance record deleted successfully', 'success');
        this.loadAttendanceTable();
    }

    deleteGrade(id) {
        let grades = this.getGrades();
        grades = grades.filter(g => g.id !== id);
        this.saveGrades(grades);
        
        this.showToast('Grade deleted successfully', 'success');
        this.loadGradesTable();
        this.updateGradesChart();
    }

    // View Student Details
    viewStudentDetails(studentId) {
        const student = this.getStudents().find(s => s.id === studentId);
        if (!student) return;

        const grades = this.getGrades().filter(g => g.studentId === studentId);
        const attendance = this.getAttendance().filter(a => a.studentId === studentId);
        
        let details = `
            <h3>${student.firstName} ${student.lastName}</h3>
            <p><strong>ID:</strong> ${student.id}</p>
            <p><strong>Email:</strong> ${student.email}</p>
            <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
            <p><strong>Class:</strong> ${student.class} ${student.section ? `- ${student.section}` : ''}</p>
            <p><strong>Status:</strong> <span class="status-badge badge-${student.status}">${student.status}</span></p>
            <p><strong>Enrollment Date:</strong> ${this.formatDate(student.enrollmentDate)}</p>
            
            <h4>Academic Summary</h4>
            <p><strong>Total Grades:</strong> ${grades.length}</p>
            <p><strong>Average Score:</strong> ${grades.length > 0 ? 
                (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(1) : 0}%</p>
            <p><strong>Attendance Rate:</strong> ${attendance.length > 0 ? 
                Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%</p>
        `;

        // Create a custom modal for details
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Student Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${details}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary modal-close">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Reports
    generateReport() {
        const type = document.getElementById('reportType').value;
        const container = document.getElementById('reportContent');
        
        let reportHTML = '';
        
        switch(type) {
            case 'attendance':
                reportHTML = this.generateAttendanceReport();
                break;
            case 'grades':
                reportHTML = this.generateGradesReport();
                break;
            case 'students':
                reportHTML = this.generateStudentsReport();
                break;
            case 'courses':
                reportHTML = this.generateCoursesReport();
                break;
        }
        
        container.innerHTML = reportHTML;
    }

    generateAttendanceReport() {
        const attendance = this.getAttendance();
        const students = this.getStudents();
        
        if (attendance.length === 0) {
            return '<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No attendance records found</p></div>';
        }

        // Group by date
        const byDate = {};
        attendance.forEach(record => {
            if (!byDate[record.date]) {
                byDate[record.date] = { present: 0, total: 0 };
            }
            byDate[record.date].total++;
            if (record.status === 'present') {
                byDate[record.date].present++;
            }
        });

        let html = `
            <h3>Attendance Report</h3>
            <p><strong>Total Records:</strong> ${attendance.length}</p>
            <p><strong>Reporting Period:</strong> ${Object.keys(byDate).length} days</p>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Present</th>
                            <th>Absent</th>
                            <th>Attendance Rate</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.keys(byDate).sort().reverse().forEach(date => {
            const data = byDate[date];
            const absent = data.total - data.present;
            const rate = Math.round((data.present / data.total) * 100);
            
            html += `
                <tr>
                    <td>${this.formatDate(date)}</td>
                    <td>${data.present}</td>
                    <td>${absent}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${rate}%"></div>
                        </div>
                        ${rate}%
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    generateGradesReport() {
        const grades = this.getGrades();
        const students = this.getStudents();
        const courses = this.getCourses();
        
        if (grades.length === 0) {
            return '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No grade records found</p></div>';
        }

        // Calculate statistics
        const totalGrades = grades.length;
        const averageScore = (grades.reduce((sum, g) => sum + g.score, 0) / totalGrades).toFixed(1);
        
        const gradeDistribution = {
            'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
        };
        
        grades.forEach(grade => {
            const letterGrade = this.calculateGrade(grade.score);
            gradeDistribution[letterGrade]++;
        });

        let html = `
            <h3>Grades Report</h3>
            <div class="stats-container" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3b82f6;">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalGrades}</h3>
                        <p>Total Grades</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #10b981;">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${averageScore}%</h3>
                        <p>Average Score</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #8b5cf6;">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${students.length}</h3>
                        <p>Students</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f59e0b;">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${courses.length}</h3>
                        <p>Courses</p>
                    </div>
                </div>
            </div>
            
            <h4>Grade Distribution</h4>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Grade</th>
                            <th>Count</th>
                            <th>Percentage</th>
                            <th>Distribution</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
            const count = gradeDistribution[grade];
            const percentage = totalGrades > 0 ? ((count / totalGrades) * 100).toFixed(1) : 0;
            
            html += `
                <tr>
                    <td><strong>${grade}</strong></td>
                    <td>${count}</td>
                    <td>${percentage}%</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    generateStudentsReport() {
        const students = this.getStudents();
        
        if (students.length === 0) {
            return '<div class="empty-state"><i class="fas fa-users"></i><p>No student records found</p></div>';
        }

        // Group by class
        const byClass = {};
        students.forEach(student => {
            if (!byClass[student.class]) {
                byClass[student.class] = [];
            }
            byClass[student.class].push(student);
        });

        let html = `
            <h3>Students Report</h3>
            <p><strong>Total Students:</strong> ${students.length}</p>
            <p><strong>Active Students:</strong> ${students.filter(s => s.status === 'active').length}</p>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Students</th>
                            <th>Active</th>
                            <th>Inactive</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        Object.keys(byClass).sort().forEach(className => {
            const classStudents = byClass[className];
            const active = classStudents.filter(s => s.status === 'active').length;
            const inactive = classStudents.length - active;
            
            html += `
                <tr>
                    <td>${className}</td>
                    <td>${classStudents.length}</td>
                    <td>${active}</td>
                    <td>${inactive}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    generateCoursesReport() {
        const courses = this.getCourses();
        const grades = this.getGrades();
        
        if (courses.length === 0) {
            return '<div class="empty-state"><i class="fas fa-book"></i><p>No course records found</p></div>';
        }

        let html = `
            <h3>Courses Report</h3>
            <p><strong>Total Courses:</strong> ${courses.length}</p>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Instructor</th>
                            <th>Status</th>
                            <th>Grades Recorded</th>
                            <th>Average Score</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        courses.forEach(course => {
            const courseGrades = grades.filter(g => g.courseId === course.id);
            const avgScore = courseGrades.length > 0 ? 
                (courseGrades.reduce((sum, g) => sum + g.score, 0) / courseGrades.length).toFixed(1) : 'N/A';
            
            html += `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${course.instructor || 'N/A'}</td>
                    <td>
                        <span class="status-badge status-${course.status}">
                            ${course.status}
                        </span>
                    </td>
                    <td>${courseGrades.length}</td>
                    <td>${avgScore}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        return html;
    }

    printReport() {
        const reportContent = document.getElementById('reportContent').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Student Management System - Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h3 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .progress-bar { width: 100px; height: 20px; background: #eee; display: inline-block; }
                        .progress-fill { height: 100%; background: #4CAF50; }
                        .status-badge { padding: 2px 8px; border-radius: 10px; font-size: 12px; }
                        .badge-active { background: #d4edda; color: #155724; }
                        .badge-inactive { background: #f8d7da; color: #721c24; }
                    </style>
                </head>
                <body>
                    ${reportContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    // Data Import/Export
    exportData() {
        const data = {
            students: this.getStudents(),
            courses: this.getCourses(),
            attendance: this.getAttendance(),
            grades: this.getGrades(),
            events: this.getEvents(),
            activities: this.getActivities(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-management-backup-${this.getTodayDate()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.students || !data.courses) {
                    throw new Error('Invalid data format');
                }
                
                // Import data
                if (confirm('This will replace all existing data. Are you sure?')) {
                    localStorage.setItem('students', JSON.stringify(data.students || []));
                    localStorage.setItem('courses', JSON.stringify(data.courses || []));
                    localStorage.setItem('attendance', JSON.stringify(data.attendance || []));
                    localStorage.setItem('grades', JSON.stringify(data.grades || []));
                    localStorage.setItem('events', JSON.stringify(data.events || []));
                    localStorage.setItem('activities', JSON.stringify(data.activities || []));
                    
                    this.showToast('Data imported successfully', 'success');
                    this.loadView(this.currentView);
                }
            } catch (error) {
                this.showToast('Failed to import data: Invalid format', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Theme Management
    checkTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
        localStorage.setItem('theme', theme);
    }

    // Modal Management
    openModal(modal) {
        this.currentModal = modal.id;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            if (modal) {
                modal.classList.remove('active');
            }
            this.currentModal = null;
            this.confirmCallback = null;
            document.body.style.overflow = '';
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-circle';
        if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
        
        toastIcon.className = `toast-icon ${iconClass}`;
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Initialize Date Pickers
    initDatePickers() {
        // Initialize flatpickr for better date picking
        const dateInputs = document.querySelectorAll('.date-picker');
        dateInputs.forEach(input => {
            flatpickr(input, {
                dateFormat: 'Y-m-d',
                allowInput: true
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentSystem = new StudentManagementSystem();
    
    // Add some sample data if empty
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    if (students.length === 0) {
        // Add sample student
        const sampleStudent = {
            id: 'STU1001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            dob: '2005-06-15',
            gender: 'male',
            class: '10A',
            section: 'Science',
            address: '123 Main St, City',
            enrollmentDate: new Date().toISOString().split('T')[0],
            status: 'active',
            notes: 'Sample student record',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('students', JSON.stringify([sampleStudent]));
        window.studentSystem.loadDashboard();
    }
});
