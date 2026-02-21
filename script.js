// Main website JavaScript - Udemy Clone

// Course Data Source
// Course Data Source - Sync with LocalStorage
const defaultCourses = [
    {
        id: 1,
        title: "Programming Fundamentals",
        img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Programming",
        instructor: "Tech Experts",
        rating: 4.8,
        students: 50000,
        price: 99,
        originalPrice: 199,
        bestseller: true,
        desc: "Master the fundamentals of programming and learn to code like a professional.",
        link: "player.html?id=1"
    },
    {
        id: 2,
        title: "JavaScript Mastery",
        img: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Programming",
        instructor: "John Doer",
        rating: 4.9,
        students: 85000,
        price: 129,
        originalPrice: 249,
        bestseller: true,
        desc: "Become proficient in interactive web development with modern JavaScript.",
        link: "player.html?id=2"
    },
    {
        id: 3,
        title: "Web Development Complete",
        img: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Programming",
        instructor: "Sarah Smith",
        rating: 4.7,
        students: 95000,
        price: 159,
        originalPrice: 299,
        bestseller: false,
        desc: "Build complete web applications with HTML, CSS, React, and Node.js.",
        link: "player.html?id=3"
    },
    {
        id: 4,
        title: "Data Science Essentials",
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Data Science",
        instructor: "Data Whiz",
        rating: 4.8,
        students: 42000,
        price: 149,
        originalPrice: 199,
        bestseller: true,
        desc: "Analyze data and derive meaningful insights using Python and Pandas.",
        link: "player.html?id=4"
    },
    {
        id: 5,
        title: "Machine Learning Advanced",
        img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Data Science",
        instructor: "AI Labs",
        rating: 4.9,
        students: 38000,
        price: 199,
        originalPrice: 299,
        bestseller: false,
        desc: "Build intelligent systems using neural networks and deep learning.",
        link: "player.html?id=5"
    },
    {
        id: 6,
        title: "UI/UX Design Masterclass",
        img: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        category: "Design",
        instructor: "Pro Designers",
        rating: 4.6,
        students: 21000,
        price: 0,
        originalPrice: 89,
        bestseller: false,
        desc: "Learn to design beautiful interfaces and user experiences that convert.",
        link: "player.html?id=6"
    }
];

// Initialize from LocalStorage or Default
let courses = JSON.parse(localStorage.getItem('udemyCourses')) || defaultCourses;
if (!localStorage.getItem('udemyCourses')) {
    localStorage.setItem('udemyCourses', JSON.stringify(defaultCourses));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Udemy Clone - System Initialized');

    // Only show published courses on homepage (pending/rejected hidden until approved)
    const published = courses.filter(c => (c.status || 'published') === 'published');
    renderCoursesByCategory(published);
    setupEventListeners();
    setupParallaxEffects();
});

// Scroll-triggered animations - Optimized
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '50px 0px 50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe course cards with initial state
    document.querySelectorAll('.course-card').forEach((card) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Parallax effects - Optimized with throttling
function setupParallaxEffects() {
    let ticking = false;
    let lastScrollY = 0;

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;

                // Only update if scroll changed significantly
                if (Math.abs(scrolled - lastScrollY) > 5) {
                    const hero = document.querySelector('.hero');

                    if (hero && scrolled < 500) {
                        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                        hero.style.opacity = Math.max(0.3, 1 - (scrolled / 500));
                    }

                    lastScrollY = scrolled;
                }

                ticking = false;
            });
            ticking = true;
        }
    };

    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            return;
        }
        scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
        }, 16); // ~60fps
    }, { passive: true });
}

// Track if cards have been animated
let cardsAnimated = false;

// Render courses by category in separate sections
function renderCoursesByCategory(data) {
    const programmingGrid = document.getElementById('programmingGrid');
    const dataScienceGrid = document.getElementById('dataScienceGrid');
    const designGrid = document.getElementById('designGrid');

    if (!programmingGrid || !dataScienceGrid || !designGrid) {
        console.error('Category grids not found');
        return;
    }

    // Clear grids
    programmingGrid.innerHTML = '';
    dataScienceGrid.innerHTML = '';
    designGrid.innerHTML = '';

    // Separate courses by category
    const programmingCourses = data.filter(c => c.category === 'Programming');
    const dataScienceCourses = data.filter(c => c.category === 'Data Science');
    const designCourses = data.filter(c => c.category === 'Design');

    // Render each category
    renderCoursesToGrid(programmingCourses, programmingGrid, 0);
    renderCoursesToGrid(dataScienceCourses, dataScienceGrid, programmingCourses.length);
    renderCoursesToGrid(designCourses, designGrid, programmingCourses.length + dataScienceCourses.length);
}

function renderCoursesToGrid(courses, grid, startIndex = 0) {
    if (courses.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">No courses available in this category yet.</p>';
        return;
    }

    const shouldAnimate = !cardsAnimated;

    courses.forEach((course, index) => {
        const card = document.createElement('div');
        card.className = 'course-card';

        if (shouldAnimate) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            // Animate in with slight delay
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, (startIndex + index) * 50);
        } else {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }

        const user = isUserLoggedIn() ? Auth.getCurrentUser() : null;
        const userId = user ? (user.id || user.email) : null;
        const inWishlist = typeof CourseUtils !== 'undefined' && userId && CourseUtils.isInWishlist(userId, course.id);

        card.innerHTML = `
            <div class="card-image-wrapper" style="position:relative;">
                <img src="${course.img}" alt="${course.title}" class="card-image" loading="lazy">
                <span class="card-badge">${course.category}</span>
                ${course.bestseller ? '<span class="card-badge" style="right: auto; left: 12px; background: #fbbf24; color: black;">Bestseller</span>' : ''}
                ${userId ? `<button type="button" onclick="toggleWishlistCard(${course.id}, this)" class="wishlist-icon" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}" style="position:absolute; top:12px; right:12px; background:rgba(255,255,255,0.9); border:none; border-radius:50%; width:36px; height:36px; cursor:pointer; font-size:1.2rem; z-index:2;">${inWishlist ? '♥' : '♡'}</button>` : ''}
            </div>
            <div class="card-content">
                <div class="card-category">${course.instructor}</div>
                <h3 class="card-title">${course.title}</h3>
                <p class="card-desc">${course.desc}</p>
                <div class="card-meta">
                    <div class="rating">
                        <span>★</span> ${course.rating} <span style="color: var(--text-secondary); margin-left: 5px; font-weight: 400;">(${(course.students || 0).toLocaleString()})</span>
                    </div>
                    <div class="price">
                        ${course.price === 0
                ? '<span style="color: #4ade80;">Free</span>'
                : `$${course.price} <s style="font-size: 0.8em; color: var(--text-secondary); margin-left: 5px;">$${course.originalPrice || (course.price * 1.5).toFixed(0)}</s>`}
                    </div>
                </div>
                <a href="course.html?id=${course.id}" class="btn btn-outline" style="width: 100%; margin-top: 16px; justify-content: center; font-weight: 700; border-width: 2px;">
                    ${course.price === 0 ? 'Start Learning' : 'View Course'}
                </a>
                ${isUserLoggedIn() ? (
                course.price === 0
                    ? `<button onclick="enrollInCourse(${course.id})" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700;">${isEnrolled(course.id) ? 'Enrolled ✓' : 'Enroll Now'}</button>`
                    : (isEnrolled(course.id)
                        ? `<a href="player.html?id=${course.id}" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; display: block; text-align: center;">Enrolled ✓ – Go to course</a>`
                        : `<a href="checkout.html?courseId=${course.id}" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700; display: block; text-align: center;">Buy Now - $${course.price}</a>`
                    )
            ) : ''}
            </div>
        `;
        grid.appendChild(card);
    });

    // Mark as animated after first render
    if (shouldAnimate) {
        cardsAnimated = true;
    }
}

function toggleWishlistCard(courseId, btn) {
    const user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }
    const userId = user.id || user.email;
    if (CourseUtils.isInWishlist(userId, courseId)) {
        CourseUtils.removeFromWishlist(userId, courseId);
        btn.textContent = '♡';
        btn.title = 'Add to wishlist';
    } else {
        CourseUtils.addToWishlist(userId, courseId);
        btn.textContent = '♥';
        btn.title = 'Remove from wishlist';
    }
}

function renderCourses(data) {
    const grid = document.getElementById('courseGrid');
    const wasEmpty = grid.innerHTML === '';

    // Only clear if we're doing a fresh render (not filtering)
    if (wasEmpty || !cardsAnimated) {
        grid.innerHTML = '';
    }

    if (data.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No courses found matching your criteria.</p>';
        return;
    }

    // If cards already animated, just update content without animation
    const shouldAnimate = !cardsAnimated && wasEmpty;

    data.forEach((course, index) => {
        const card = document.createElement('div');
        card.className = 'course-card';

        if (shouldAnimate) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            // Animate in with slight delay
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        } else {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${course.img}" alt="${course.title}" class="card-image" loading="lazy">
                <span class="card-badge">${course.category}</span>
                ${course.bestseller ? '<span class="card-badge" style="right: auto; left: 12px; background: #fbbf24; color: black;">Bestseller</span>' : ''}
            </div>
            <div class="card-content">
                <div class="card-category">${course.instructor}</div>
                <h3 class="card-title">${course.title}</h3>
                <p class="card-desc">${course.desc}</p>
                <div class="card-meta">
                    <div class="rating">
                        <span>★</span> ${course.rating} <span style="color: var(--text-secondary); margin-left: 5px; font-weight: 400;">(${course.students.toLocaleString()})</span>
                    </div>
                    <div class="price">
                        ${course.price === 0
                ? '<span style="color: #4ade80;">Free</span>'
                : `$${course.price} <s style="font-size: 0.8em; color: var(--text-secondary); margin-left: 5px;">$${course.originalPrice || (course.price * 1.5).toFixed(0)}</s>`}
                    </div>
                </div>
                <a href="course.html?id=${course.id}" class="btn btn-outline" style="width: 100%; margin-top: 16px; justify-content: center; font-weight: 700; border-width: 2px;">
                    ${course.price === 0 ? 'Start Learning' : 'View Course'}
                </a>
                ${isUserLoggedIn() ? (
                course.price === 0
                    ? `<button onclick="enrollInCourse(${course.id})" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700;">${isEnrolled(course.id) ? 'Enrolled ✓' : 'Enroll Now'}</button>`
                    : (isEnrolled(course.id)
                        ? `<a href="player.html?id=${course.id}" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700; background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; display: block; text-align: center;">Enrolled ✓ – Go to course</a>`
                        : `<a href="checkout.html?courseId=${course.id}" class="btn btn-primary" style="width: 100%; margin-top: 8px; font-weight: 700; display: block; text-align: center;">Buy Now - $${course.price}</a>`
                    )
            ) : ''}
            </div>
        `;
        grid.appendChild(card);
    });

    // Mark as animated after first render
    if (shouldAnimate) {
        cardsAnimated = true;
    }
}

function setupEventListeners() {
    function applyFilters() {
        const searchEl = document.getElementById('searchInput') || document.getElementById('filterSearch');
        const query = searchEl ? searchEl.value.trim() : '';
        const category = (document.getElementById('filterCategory') && document.getElementById('filterCategory').value) || 'all';
        const price = document.getElementById('filterPrice') && document.getElementById('filterPrice').value;
        const minRating = document.getElementById('filterRating') && document.getElementById('filterRating').value;
        const level = document.getElementById('filterLevel') && document.getElementById('filterLevel').value;
        const sort = document.getElementById('filterSort') && document.getElementById('filterSort').value;

        let filtered;
        if (typeof CourseUtils !== 'undefined') {
            filtered = CourseUtils.searchCourses(query, {
                category: category !== 'all' ? category : undefined,
                price: price || undefined,
                minRating: minRating ? parseFloat(minRating) : undefined,
                level: level !== 'all' ? level : undefined,
                sort: sort || undefined
            });
        } else {
            filtered = courses.filter(course => {
                const matchSearch = !query || course.title.toLowerCase().includes(query.toLowerCase()) ||
                    (course.desc && course.desc.toLowerCase().includes(query.toLowerCase())) ||
                    course.instructor.toLowerCase().includes(query.toLowerCase());
                const matchCat = category === 'all' || course.category === category;
                return matchSearch && matchCat;
            });
        }
        renderCoursesByCategory(filtered);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    const filterSearch = document.getElementById('filterSearch');
    if (filterSearch) filterSearch.addEventListener('input', applyFilters);
    ['filterCategory', 'filterPrice', 'filterRating', 'filterLevel', 'filterSort'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });
}

function getActiveCategory() {
    return document.querySelector('.chip.active').dataset.category;
}

function filterCourses(searchTerm, category) {
    const filtered = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
            course.desc.toLowerCase().includes(searchTerm);
        const matchesCategory = category === 'all' || course.category === category;

        return matchesSearch && matchesCategory;
    });

    renderCourses(filtered);
}

function isUserLoggedIn() {
    const user = Auth.getCurrentUser();
    return user !== null;
}

function isEnrolled(courseId) {
    const user = Auth.getCurrentUser();
    if (!user || !user.enrolledCourses) return false;
    return user.enrolledCourses.includes(courseId);
}

function enrollInCourse(courseId) {
    const user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Get all users
    const users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
    const userIndex = users.findIndex(u => u.email === user.email);

    if (userIndex !== -1) {
        if (!users[userIndex].enrolledCourses) {
            users[userIndex].enrolledCourses = [];
        }

        if (!users[userIndex].enrolledCourses.includes(courseId)) {
            users[userIndex].enrolledCourses.push(courseId);
            localStorage.setItem('udemyUsers', JSON.stringify(users));

            // Update current user session
            const updatedUser = { ...user, enrolledCourses: users[userIndex].enrolledCourses };
            Auth.setCurrentUser(updatedUser);

            // Show notification
            showEnrollmentNotification('Course enrolled successfully!');

            // Re-render courses to update button
            renderCoursesByCategory(courses);
        } else {
            showEnrollmentNotification('You are already enrolled in this course!', 'info');
        }
    }
}

function showEnrollmentNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
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
    notification.innerHTML = `<span style="font-size: 1.2rem;">${type === 'success' ? '✓' : 'ℹ'}</span><span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
