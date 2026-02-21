// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('Teacher Panel Initialized');
    Auth.checkTeacherAccess();

    const user = Auth.getCurrentUser();
    if (user) {
        document.getElementById('teacherName').textContent = user.name;
    }

    loadMyCourses();
    loadInstructorAnalytics();
    setupTeacherListeners();
});

function loadInstructorAnalytics() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    const courses = getCourses();
    const myCourses = courses.filter(c => c.instructor === user.name && (c.status || 'published') === 'published');
    const totalStudents = myCourses.reduce((sum, c) => sum + (c.students || 0), 0);
    const estimatedRevenue = myCourses.reduce((sum, c) => sum + (c.students || 0) * (c.price || 0) * 0.7, 0);
    const avgRating = myCourses.length ? myCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / myCourses.length : 0;

    const courseCountEl = document.getElementById('teacherCourseCount');
    const studentCountEl = document.getElementById('teacherStudentCount');
    const revenueEl = document.getElementById('teacherRevenue');
    const ratingEl = document.getElementById('teacherRating');
    if (courseCountEl) courseCountEl.textContent = myCourses.length;
    if (studentCountEl) studentCountEl.textContent = totalStudents.toLocaleString();
    if (revenueEl) revenueEl.textContent = '$' + Math.round(estimatedRevenue).toLocaleString();
    if (ratingEl) ratingEl.textContent = myCourses.length ? avgRating.toFixed(1) + '★' : '–';
}

function getCourses() {
    const data = localStorage.getItem('udemyCourses');
    return data ? JSON.parse(data) : [];
}

function saveCourses(courses) {
    localStorage.setItem('udemyCourses', JSON.stringify(courses));
}

function loadMyCourses() {
    const user = Auth.getCurrentUser();
    const courses = getCourses();

    // Filter for THIS instructor
    const myCourses = courses.filter(c => c.instructor === user.name);

    const tableBody = document.getElementById('courseTableBody');
    tableBody.innerHTML = '';

    if (myCourses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">You haven\'t created any courses yet.</td></tr>';
        return;
    }

    myCourses.forEach((course) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${course.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${course.img}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" alt="">
                    <span>${course.title}</span>
                </div>
            </td>
            <td>${course.students ? course.students.toLocaleString() : 0}</td>
            <td>⭐ ${course.rating}</td>
            <td>${course.price === 0 ? '<span class="status active">Free</span>' : '$' + course.price}</td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        let courses = getCourses();
        courses = courses.filter(c => c.id !== id);
        saveCourses(courses);
        loadMyCourses();
        showNotification('Course deleted successfully', 'success');
    }
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

// Add keyframes
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

// Modal Logic
function openAddModal() {
    document.getElementById('addCourseModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addCourseModal').classList.remove('active');
}

function togglePriceInput() {
    const isFree = document.getElementById('isFree').checked;
    const priceInput = document.getElementById('coursePrice');
    if (isFree) {
        priceInput.value = 0;
        priceInput.disabled = true;
        priceInput.style.opacity = '0.5';
    } else {
        priceInput.disabled = false;
        priceInput.style.opacity = '1';
    }
}

// Add Course
// Add Course
document.getElementById('addCourseForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();

    const title = document.getElementById('courseTitle').value;
    const img = document.getElementById('courseImg').value;
    const category = document.getElementById('courseCategory').value;
    const isFree = document.getElementById('isFree').checked;
    let price = parseFloat(document.getElementById('coursePrice').value);
    const desc = document.getElementById('courseDesc').value;
    const curriculumText = document.getElementById('courseCurriculum').value;

    if (isFree) price = 0;

    // Parse Curriculum
    const curriculum = parseCurriculum(curriculumText);

    const courses = getCourses();
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 100;

    const newCourse = {
        id: newId,
        title: title,
        img: img,
        category: category,
        instructor: user.name,
        rating: 5.0,
        students: 0,
        price: price,
        originalPrice: price === 0 ? 0 : Math.round(price * 1.5),
        desc: desc,
        bestseller: false,
        status: 'pending',
        link: "player.html?id=" + newId,
        curriculum: curriculum
    };

    courses.push(newCourse);
    saveCourses(courses);

    closeAddModal();
    loadMyCourses();
    showNotification('Course & Curriculum Created Successfully!', 'success');
    e.target.reset();
    togglePriceInput(); // Reset price input state
});

function parseCurriculum(text) {
    const lines = text.split('\n');
    const curriculum = [];
    let currentSection = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        if (line.startsWith('--')) {
            // Lesson
            if (!currentSection) {
                // Fallback if no section defined yet
                currentSection = { title: "Introduction", lessons: [] };
                curriculum.push(currentSection);
            }

            // Format: -- Title | URL
            // safe split
            const parts = line.substring(2).split('|');
            const title = parts[0].trim();
            const url = parts[1] ? parts[1].trim() : '';

            currentSection.lessons.push({
                title: title,
                url: url,
                duration: "5:00",
                completed: false
            });
        } else {
            // New Section
            currentSection = {
                title: line,
                lessons: []
            };
            curriculum.push(currentSection);
        }
    });

    // Default if empty input
    if (curriculum.length === 0) {
        curriculum.push({
            title: "Course Content",
            lessons: [{ title: "Welcome", url: "", duration: "1:00" }]
        });
    }

    return curriculum;
}

function setupTeacherListeners() {
    //
}
