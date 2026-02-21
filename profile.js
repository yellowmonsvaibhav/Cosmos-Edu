// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupEditForm();
});

function loadProfileData() {
    const user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Update header name
    document.getElementById('userNameNav').textContent = user.name;

    // Update profile info
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Set avatar initial
    const avatar = document.getElementById('profileAvatar');
    avatar.textContent = user.name.charAt(0).toUpperCase();

    // Calculate member since
    const memberSince = new Date().getFullYear();
    document.getElementById('memberSince').textContent = `Member since ${memberSince}`;

    // Load subscription status
    loadSubscriptionStatus(user);

    // Load enrolled courses
    loadEnrolledCourses(user);

    // Load certificates
    loadCertificates(user);

    // Calculate stats
    calculateStats(user);
}

function loadCertificates(user) {
    const userId = user.id || user.email;
    const certificates = typeof CourseUtils !== 'undefined' ? CourseUtils.getCertificates(userId) : [];
    const countEl = document.getElementById('certificates');
    const listEl = document.getElementById('certificatesList');
    const sectionEl = document.getElementById('certificatesSection');

    if (countEl) countEl.textContent = certificates.length;

    if (!listEl) return;

    if (certificates.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-secondary); padding: 24px;">No certificates yet. Complete a course to earn your first certificate!</p>';
        return;
    }

    listEl.innerHTML = certificates.map(c => `
        <div class="course-item" style="display: flex; align-items: center; gap: 20px; padding: 20px; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 16px;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #8b5cf6, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">🎓</div>
            <div style="flex: 1;">
                <h3 style="margin-bottom: 4px;">${c.courseTitle}</h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">${new Date(c.issuedAt).toLocaleDateString()} • ${c.certificateNumber}</p>
            </div>
        </div>
    `).join('');
}

function loadSubscriptionStatus(user) {
    if (user.subscription && user.subscription.status === 'active') {
        const statusDiv = document.getElementById('subscriptionStatus');
        const infoDiv = document.getElementById('subscriptionInfo');
        
        statusDiv.style.display = 'block';
        
        const planName = user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1);
        const nextBilling = new Date(user.subscription.nextBillingDate).toLocaleDateString();
        
        infoDiv.innerHTML = `
            <div style="padding: 16px; background: rgba(139, 92, 246, 0.1); border-radius: var(--radius-sm); margin-bottom: 12px;">
                <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">${planName} Plan</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">$${user.subscription.price}/month</div>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.85rem;">
                <p>Next billing: ${nextBilling}</p>
                <a href="subscription.html" style="color: var(--primary-color); text-decoration: underline;">Manage</a>
            </div>
        `;
    }
}

function loadEnrolledCourses(user) {
    const courses = JSON.parse(localStorage.getItem('udemyCourses')) || [];
    const enrolledCourses = user.enrolledCourses || [];
    const container = document.getElementById('enrolledCourses');

    if (enrolledCourses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <p style="font-size: 1.1rem; margin-bottom: 16px;">No enrolled courses yet</p>
                <a href="index.html" class="btn btn-primary">Browse Courses</a>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    const userId = user.id || user.email;
    enrolledCourses.forEach((courseId, index) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        let progress = 0;
        if (typeof CourseUtils !== 'undefined') {
            const prog = CourseUtils.getProgress(userId, courseId);
            progress = prog.progressPercent || 0;
        } else {
            progress = Math.floor(Math.random() * 100);
        }

        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.style.animationDelay = `${index * 0.1}s`;
        courseItem.innerHTML = `
            <img src="${course.img}" alt="${course.title}" class="course-item-img">
            <div class="course-item-info">
                <h3>${course.title}</h3>
                <p>${course.instructor} • ${course.category}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">${progress}% Complete</p>
                ${course.price > 0 ? `<a href="#" onclick="requestRefund(${course.id}); return false;" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px; display: inline-block;">Request refund</a>` : ''}
            </div>
            <a href="player.html?id=${course.id}" class="btn btn-outline" style="align-self: center; padding: 10px 20px;">Continue</a>
        `;
        container.appendChild(courseItem);
    });
}

function calculateStats(user) {
    const courses = JSON.parse(localStorage.getItem('udemyCourses')) || [];
    const enrolledCourses = user.enrolledCourses || [];
    const userId = user.id || user.email;

    document.getElementById('coursesEnrolled').textContent = enrolledCourses.length;

    let completed = 0;
    if (typeof CourseUtils !== 'undefined') {
        const certs = CourseUtils.getCertificates(userId);
        completed = certs.length;
    } else {
        completed = Math.floor(enrolledCourses.length * 0.3);
    }
    document.getElementById('coursesCompleted').textContent = completed;

    const learningHours = enrolledCourses.length * 5;
    document.getElementById('learningHours').textContent = learningHours;

    const certCount = typeof CourseUtils !== 'undefined' ? CourseUtils.getCertificates(userId).length : completed;
    document.getElementById('certificates').textContent = certCount;
}

function setupEditForm() {
    const form = document.getElementById('editProfileForm');
    const user = Auth.getCurrentUser();

    if (form) {
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('editName').value.trim();
            const newEmail = document.getElementById('editEmail').value.trim();

            // Update user in localStorage
            const users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
            const userIndex = users.findIndex(u => u.email === user.email);
            
            if (userIndex !== -1) {
                users[userIndex].name = newName;
                users[userIndex].email = newEmail;
                localStorage.setItem('udemyUsers', JSON.stringify(users));

                // Update current user session
                const updatedUser = { ...user, name: newName, email: newEmail };
                Auth.setCurrentUser(updatedUser);

                // Show success message
                showNotification('Profile updated successfully!', 'success');
                
                // Reload page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    }
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Animate modal
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }, 300);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification`;
    const icon = type === 'success' ? '✓' : '✕';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
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

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});
