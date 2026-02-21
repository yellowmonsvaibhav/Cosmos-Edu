// Admin Panel JavaScript - Connected to LocalStorage

// 1. Initialize State
document.addEventListener('DOMContentLoaded', function () {
    console.log('Admin Panel - Deep Space Mode');
    loadCoursesFromStorage();
    loadUsersFromStorage();
    loadInstructorApplications();
    loadRefunds();
    loadCoupons();
    populateCouponCourseSelect();
    updateStats();
    setupAdminListeners();
});

// 2. Data Management (LocalStorage)
function getCourses() {
    const data = localStorage.getItem('udemyCourses');
    return data ? JSON.parse(data) : [];
}

function saveCourses(courses) {
    localStorage.setItem('udemyCourses', JSON.stringify(courses));
}

// 3. Render Logic
function loadCoursesFromStorage() {
    const courses = getCourses();
    const tableBody = document.getElementById('courseTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (courses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No courses found. Add one!</td></tr>';
        return;
    }

    courses.forEach((course) => {
        const status = course.status || 'published';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${course.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${course.img}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" alt="">
                    <span>${course.title}</span>
                </div>
            </td>
            <td><span class="status ${status === 'published' ? 'active' : status === 'pending' ? 'inactive' : 'inactive'}">${status}</span></td>
            <td>${course.students ? course.students.toLocaleString() : 0}</td>
            <td>⭐ ${course.rating || 0}</td>
            <td>${course.price === 0 ? '<span class="status active">Free</span>' : '$' + course.price}</td>
            <td>
                ${status === 'pending' ? `<button class="action-btn edit-btn" onclick="approveCourse(${course.id})">Approve</button> <button class="action-btn delete-btn" onclick="rejectCourse(${course.id})">Reject</button> ` : ''}
                <button class="action-btn delete-btn" onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    
    updateStats();
}

function loadUsersFromStorage() {
    const users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No users registered yet.</td></tr>';
        return;
    }

    users.forEach((user, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.enrolledCourses ? user.enrolledCourses.length : 0}</td>
            <td><span class="status active">Active</span></td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.email}')">Remove</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function updateStats() {
    const courses = getCourses();
    const users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
    
    // Update stat cards if they exist
    const totalCoursesEl = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const totalStudentsEl = document.querySelector('.stat-card:nth-child(2) .stat-number');
    
    if (totalCoursesEl) {
        totalCoursesEl.textContent = courses.length;
    }
    
    if (totalStudentsEl) {
        const totalEnrollments = users.reduce((sum, user) => {
            return sum + (user.enrolledCourses ? user.enrolledCourses.length : 0);
        }, 0);
        totalStudentsEl.textContent = totalEnrollments.toLocaleString();
    }
}

function deleteUser(email) {
    if (confirm('Are you sure you want to remove this user?')) {
        let users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
        users = users.filter(u => u.email !== email);
        localStorage.setItem('udemyUsers', JSON.stringify(users));
        loadUsersFromStorage();
        showNotification('User removed successfully!', 'success');
    }
}

function approveCourse(id) {
    let courses = getCourses();
    const i = courses.findIndex(c => c.id === id);
    if (i !== -1) {
        courses[i].status = 'published';
        courses[i].publishedAt = new Date().toISOString();
        saveCourses(courses);
        loadCoursesFromStorage();
        showNotification('Course approved and published.', 'success');
    }
}

function rejectCourse(id) {
    let courses = getCourses();
    const i = courses.findIndex(c => c.id === id);
    if (i !== -1) {
        courses[i].status = 'rejected';
        saveCourses(courses);
        loadCoursesFromStorage();
        showNotification('Course rejected.', 'success');
    }
}

function loadRefunds() {
    const container = document.getElementById('refundsContainer');
    if (!container || typeof CourseUtils === 'undefined') return;
    const refunds = CourseUtils.getRefunds();
    if (refunds.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 24px;">No refund requests.</p>';
        return;
    }
    container.innerHTML = refunds.map(r => `
        <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
                <strong>${r.userEmail}</strong> – Course #${r.courseId}<br>
                <span style="font-size: 0.9rem; color: var(--text-secondary);">${r.reason || 'No reason'}</span><br>
                <span class="status ${r.status === 'pending' ? 'inactive' : 'active'}">${r.status}</span>
            </div>
            ${r.status === 'pending' ? `<button class="action-btn edit-btn" onclick="resolveRefund(${r.id}, true)">Approve</button> <button class="action-btn delete-btn" onclick="resolveRefund(${r.id}, false)">Reject</button>` : ''}
        </div>
    `).join('');
}

function resolveRefund(id, approved) {
    if (typeof CourseUtils === 'undefined') return;
    CourseUtils.resolveRefund(id, approved);
    loadRefunds();
    showNotification(approved ? 'Refund approved.' : 'Refund rejected.', 'success');
}

function populateCouponCourseSelect() {
    const sel = document.getElementById('newCouponCourse');
    if (!sel) return;
    const courses = getCourses();
    sel.innerHTML = '<option value="">All courses</option>' + courses.filter(c => (c.status || 'published') === 'published').map(c => `<option value="${c.id}">${c.title}</option>`).join('');
}

function loadCoupons() {
    const container = document.getElementById('couponsList');
    if (!container || typeof CourseUtils === 'undefined') return;
    const coupons = CourseUtils.getCoupons();
    if (coupons.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 24px;">No coupons yet.</p>';
        return;
    }
    container.innerHTML = '<table class="admin-table"><thead><tr><th>Code</th><th>Discount %</th><th>Course</th></tr></thead><tbody>' +
        coupons.map(c => `<tr><td>${c.code}</td><td>${c.discountPercent || 0}%</td><td>${c.courseId ? 'Course #' + c.courseId : 'All'}</td></tr>`).join('') + '</tbody></table>';
}

function createCoupon() {
    const code = document.getElementById('newCouponCode') && document.getElementById('newCouponCode').value.trim();
    const discount = document.getElementById('newCouponDiscount') && parseInt(document.getElementById('newCouponDiscount').value, 10);
    const courseId = document.getElementById('newCouponCourse') && document.getElementById('newCouponCourse').value;
    if (!code || !discount || discount < 1 || discount > 100) {
        showNotification('Enter a valid code and discount (1–100%).', 'error');
        return;
    }
    if (typeof CourseUtils === 'undefined') return;
    CourseUtils.saveCoupon({ code, discountPercent: discount, courseId: courseId ? parseInt(courseId, 10) : null });
    document.getElementById('newCouponCode').value = '';
    document.getElementById('newCouponDiscount').value = '';
    loadCoupons();
    showNotification('Coupon created.', 'success');
}

// 4. Action Handlers
function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course? It will disappear from the homepage.')) {
        let courses = getCourses();
        courses = courses.filter(c => c.id !== id);
        saveCourses(courses);
        loadCoursesFromStorage();
        showNotification('Course deleted successfully!', 'success');
    }
}

// 5. Modal & Form Logic
function openAddModal() {
    const modal = document.getElementById('addCourseModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeAddModal() {
    const modal = document.getElementById('addCourseModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function togglePriceInput() {
    const isFree = document.getElementById('isFree');
    const priceInput = document.getElementById('coursePrice');
    
    if (isFree && priceInput) {
        if (isFree.checked) {
            priceInput.value = 0;
            priceInput.disabled = true;
            priceInput.style.opacity = '0.5';
        } else {
            priceInput.disabled = false;
            priceInput.style.opacity = '1';
        }
    }
}

// 6. Add New Course Logic
function setupAddCourseForm() {
    const form = document.getElementById('addCourseForm');
    if (!form) return;
    
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('courseTitle').value.trim();
        const img = document.getElementById('courseImg').value.trim();
        const category = document.getElementById('courseCategory').value.trim();
        const isFree = document.getElementById('isFree').checked;
        let price = parseFloat(document.getElementById('coursePrice').value);
        const desc = document.getElementById('courseDesc').value.trim();

        // Validation
        if (!title || title.length < 3) {
            showNotification('Course title must be at least 3 characters', 'error');
            return;
        }

        if (!img || !img.startsWith('http')) {
            showNotification('Please provide a valid image URL', 'error');
            return;
        }

        if (!category) {
            showNotification('Please select a category', 'error');
            return;
        }

        if (!desc || desc.length < 10) {
            showNotification('Description must be at least 10 characters', 'error');
            return;
        }

        if (isFree) price = 0;

        const courses = getCourses();
        const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;

        const newCourse = {
            id: newId,
            title: title,
            img: img,
            category: category,
            instructor: "New Teacher",
            rating: 5.0,
            students: 0,
            price: price,
            originalPrice: price === 0 ? 0 : Math.round(price * 1.5),
            desc: desc,
            bestseller: false,
            link: "player.html?id=" + newId
        };

        courses.push(newCourse);
        saveCourses(courses);

        // UI Updates
        closeAddModal();
        loadCoursesFromStorage();
        showNotification('New Course Uploaded Successfully!', 'success');

        // Reset Form
        e.target.reset();
        togglePriceInput();
    });
}

// 7. Notification Helper (Enhanced)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 3000;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    notification.innerHTML = `<span style="font-size: 1.2rem;">${icon}</span><span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function setupAdminListeners() {
    setupAddCourseForm();
    setupSearchFunctionality();
    setupFilterFunctionality();
}

function setupSearchFunctionality() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = document.querySelector('#userTableBody');
            if (table) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    }
}

function setupFilterFunctionality() {
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value.toLowerCase();
            const table = document.querySelector('#userTableBody');
            if (table) {
                const rows = table.querySelectorAll('tr');
                if (filterValue === 'all users') {
                    rows.forEach(row => row.style.display = '');
                } else {
                    rows.forEach(row => {
                        const statusCell = row.querySelector('.status');
                        if (statusCell) {
                            const status = statusCell.textContent.toLowerCase();
                            row.style.display = status.includes(filterValue) ? '' : 'none';
                        }
                    });
                }
            }
        });
    }
}

function scrollToSettings() {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
        settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Add keyframes for notification
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes slideIn {
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);

// Instructor Applications Management
function loadInstructorApplications() {
    if (!Auth.getInstructorApplications) return;
    
    const applications = Auth.getInstructorApplications();
    const container = document.getElementById('applicationsContainer');
    const noApplicationsDiv = document.getElementById('noApplications');

    if (!container) return;
    
    container.innerHTML = '';

    // Filter for pending applications
    const pendingApps = applications.filter(app => app.applicationStatus === 'pending');

    if (pendingApps.length === 0) {
        if (noApplicationsDiv) {
            noApplicationsDiv.style.display = 'block';
        }
        return;
    }

    if (noApplicationsDiv) {
        noApplicationsDiv.style.display = 'none';
    }

    pendingApps.forEach(app => {
        const appCard = document.createElement('div');
        appCard.style.cssText = `
            background: rgba(26, 26, 31, 0.6);
            border: 1px solid rgba(45, 212, 191, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
        `;

        appCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">${app.name}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${app.email}</p>
                </div>
                <span style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                    Pending
                </span>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div>
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 4px;">Professional Title</p>
                    <p style="color: var(--text-primary); font-weight: 500;">${app.professionalTitle || 'N/A'}</p>
                </div>
                <div>
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 4px;">Experience</p>
                    <p style="color: var(--text-primary); font-weight: 500;">${app.experience || 0} years</p>
                </div>
                <div>
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 4px;">Expertise</p>
                    <p style="color: var(--text-primary); font-weight: 500;">${app.expertise || 'N/A'}</p>
                </div>
                <div>
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 4px;">Phone</p>
                    <p style="color: var(--text-primary); font-weight: 500;">${app.phone || 'N/A'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <p style="color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;">Professional Bio</p>
                <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.9rem;">${app.bio || 'No bio provided'}</p>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button onclick="approveApplication(${app.id})" class="action-btn" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; flex: 1; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    ✓ Approve Application
                </button>
                <button onclick="rejectApplication(${app.id})" class="action-btn delete-btn" style="flex: 1; padding: 12px;">
                    ✕ Reject
                </button>
            </div>
        `;

        container.appendChild(appCard);
    });
}

function viewDocument(userId, docType, docTitle) {
    if (!Auth.getUsers) return;
    
    const users = Auth.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user || !user.documents || !user.documents[docType]) {
        showNotification('Document not found', 'error');
        return;
    }

    const doc = user.documents[docType];
    const modal = document.getElementById('documentModal');
    const titleEl = document.getElementById('documentTitle');
    const viewer = document.getElementById('documentViewer');

    if (!modal || !titleEl || !viewer) return;

    titleEl.textContent = docTitle + ' - ' + user.name;

    // Display document based on type
    if (doc.type && doc.type.includes('pdf')) {
        viewer.innerHTML = `
            <p style="color: var(--text-secondary); margin-bottom: 16px;">PDF File: ${doc.name}</p>
            <iframe src="${doc.data}" style="width: 100%; height: 600px; border: 1px solid rgba(45, 212, 191, 0.2); border-radius: 8px;"></iframe>
            <a href="${doc.data}" download="${doc.name}" class="action-btn" style="margin-top: 16px; display: inline-block;">
                Download PDF
            </a>
        `;
    } else {
        viewer.innerHTML = `
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${doc.name} (${formatFileSize(doc.size || 0)})</p>
            <img src="${doc.data}" style="max-width: 100%; height: auto; border: 1px solid rgba(45, 212, 191, 0.2); border-radius: 8px;" alt="${docTitle}">
            <a href="${doc.data}" download="${doc.name}" class="action-btn" style="margin-top: 16px; display: inline-block;">
                Download Image
            </a>
        `;
    }

    modal.classList.add('active');
}

function closeDocumentModal() {
    const modal = document.getElementById('documentModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function approveApplication(userId) {
    if (!Auth.approveInstructorApplication) return;
    
    if (confirm('Approve this instructor application? The user will be granted instructor access.')) {
        const result = Auth.approveInstructorApplication(userId);

        if (result.success) {
            showNotification('Instructor application approved! 🎉', 'success');
            loadInstructorApplications();
            loadUsersFromStorage();
        } else {
            showNotification(result.message, 'error');
        }
    }
}

function rejectApplication(userId) {
    if (!Auth.rejectInstructorApplication) return;
    
    const reason = prompt('Enter rejection reason (optional):');

    if (confirm('Reject this instructor application?')) {
        const result = Auth.rejectInstructorApplication(userId, reason);

        if (result.success) {
            showNotification('Application rejected', 'success');
            loadInstructorApplications();
        } else {
            showNotification(result.message, 'error');
        }
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('addCourseModal');
    if (e.target === modal) {
        closeAddModal();
    }
    
    const docModal = document.getElementById('documentModal');
    if (e.target === docModal) {
        closeDocumentModal();
    }
});
