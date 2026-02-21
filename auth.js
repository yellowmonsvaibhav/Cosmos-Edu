// Authentication Logic - Udemy Clone

const Auth = {
    // Keys for LocalStorage
    USERS_KEY: 'udemyUsers',
    CURRENT_USER_KEY: 'udemyCurrentUser',

    // Helper: Get all users
    getUsers: function () {
        const usersJSON = localStorage.getItem(this.USERS_KEY);
        let users = usersJSON ? JSON.parse(usersJSON) : [];

        let needsSave = false;

        // Seed Default Admin if it doesn't exist
        const adminEmail = "admin@cosmos.com";
        if (!users.find(u => u.email === adminEmail)) {
            users.push({
                id: 1,
                name: "Cosmos Admin",
                email: adminEmail,
                password: "admin",
                role: "admin",
                enrolledCourses: []
            });
            needsSave = true;
        }

        // Seed Default Teacher if it doesn't exist
        const teacherEmail = "teacher@cosmos.com";
        if (!users.find(u => u.email === teacherEmail)) {
            users.push({
                id: 2,
                name: "Cosmos Instructor",
                email: teacherEmail,
                password: "teacher",
                role: "teacher",
                enrolledCourses: []
            });
            needsSave = true;
        }

        if (needsSave) {
            this.saveUsers(users);
        }

        return users;
    },

    // Helper: Save users
    saveUsers: function (users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    // Register a new user
    register: function (name, email, password) {
        const users = this.getUsers();

        // Check if email exists
        if (users.find(user => user.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // In a real app, hash this!
            role: 'student', // Default role
            enrolledCourses: []
        };

        // Simple Admin Check (Hardcoded for demo)
        if (email.toLowerCase().includes('admin')) {
            newUser.role = 'admin';
        }
        // Teacher Check
        if (email.toLowerCase().includes('teacher')) {
            newUser.role = 'teacher';
        }

        users.push(newUser);
        this.saveUsers(users);

        // Auto-login after register
        this.setCurrentUser(newUser);

        return { success: true, user: newUser };
    },

    // Login user
    login: function (email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.setCurrentUser(user);
            return { success: true, user: user };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    },

    // Logout
    logout: function () {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.reload();
    },

    // Set Session
    setCurrentUser: function (user) {
        // Don't save password in session
        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(sessionUser));
    },

    // Get Session
    getCurrentUser: function () {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // Update Header UI
    updateHeaderUI: function () {
        const user = this.getCurrentUser();
        const navLinks = document.querySelector('.nav-links');

        if (!navLinks) return;

        // Remove existing auth-related items first
        const items = navLinks.querySelectorAll('li');
        items.forEach(item => {
            const text = item.innerText || item.textContent || '';
            if (text.includes('Log In') || text.includes('Sign Up') ||
                text.includes('Profile') || text.includes('Hi,') ||
                text.includes('Log Out') || item.querySelector('a[href="profile.html"]')) {
                item.remove();
            }
        });

        if (user) {
            // Logged In View - "Become an Instructor" already in HTML; add Profile, Hi, Log Out only
            const profileLi = document.createElement('li');
            profileLi.innerHTML = `<a href="profile.html" class="nav-link">Profile</a>`;
            navLinks.appendChild(profileLi);

            const userLi = document.createElement('li');
            userLi.innerHTML = `<span class="nav-link nav-user-greeting" style="color: var(--primary-color); cursor: default;">Hi, ${user.name}</span>`;
            navLinks.appendChild(userLi);

            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = `<a href="#" class="btn btn-outline nav-auth-logout" style="padding: 8px 20px; font-size: 0.9rem; border-color: var(--primary-color);">Log Out</a>`;
            logoutLi.onclick = (e) => {
                e.preventDefault();
                this.logout();
            };
            navLinks.appendChild(logoutLi);

        } else {
            // Guest View - Ensure login/signup links exist
            const hasLogin = Array.from(navLinks.querySelectorAll('a')).some(a =>
                a.href.includes('login.html') || a.textContent.includes('Log In')
            );
            const hasSignup = Array.from(navLinks.querySelectorAll('a')).some(a =>
                a.href.includes('signup.html') || a.textContent.includes('Sign Up')
            );

            if (!hasLogin) {
                const loginLi = document.createElement('li');
                loginLi.innerHTML = `<a href="login.html" class="nav-link">Log In</a>`;
                navLinks.appendChild(loginLi);
            }

            if (!hasSignup) {
                const signupLi = document.createElement('li');
                signupLi.innerHTML = `<a href="signup.html" class="btn btn-primary" style="padding: 8px 20px; font-size: 0.9rem;">Sign Up</a>`;
                navLinks.appendChild(signupLi);
            }
        }
    },

    // Guard for Admin Pages
    checkAdminAccess: function () {
        const user = this.getCurrentUser();
        if (!user || user.role !== 'admin') {
            window.location.href = 'login.html';
        }
    },

    // Guard for Teacher Pages
    checkTeacherAccess: function () {
        const user = this.getCurrentUser();
        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            // Let admins view teacher pages too just in case
            window.location.href = 'login.html';
        }
    },

    // Register Instructor Application
    registerInstructor: function (formData) {
        const users = this.getUsers();

        // Check if email exists
        if (users.find(user => user.email === formData.email)) {
            return { success: false, message: 'Email already registered. Please use a different email or login to your account.' };
        }

        // Validate phone number
        if (formData.phone.length < 10) {
            return { success: false, message: 'Please enter a valid phone number' };
        }

        // Validate bio length
        if (formData.bio.length < 50) {
            return { success: false, message: 'Professional bio must be at least 50 characters' };
        }

        const newInstructor = {
            id: Date.now(),
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: 'instructor_pending', // Pending approval
            phone: formData.phone,
            professionalTitle: formData.title,
            experience: formData.experience,
            expertise: formData.expertise,
            bio: formData.bio,
            documents: formData.documents,
            applicationStatus: 'pending',
            appliedAt: new Date().toISOString(),
            enrolledCourses: []
        };

        users.push(newInstructor);
        this.saveUsers(users);

        return { success: true, message: 'Application submitted successfully!', user: newInstructor };
    },

    // Get All Instructor Applications
    getInstructorApplications: function () {
        const users = this.getUsers();
        return users.filter(u => u.role === 'instructor_pending' || u.applicationStatus);
    },

    // Approve Instructor Application
    approveInstructorApplication: function (userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        user.role = 'teacher';
        user.applicationStatus = 'approved';
        user.approvedAt = new Date().toISOString();

        this.saveUsers(users);
        return { success: true, message: 'Instructor application approved!', user: user };
    },

    // Reject Instructor Application
    rejectInstructorApplication: function (userId, reason = '') {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        user.applicationStatus = 'rejected';
        user.rejectedAt = new Date().toISOString();
        user.rejectionReason = reason;

        this.saveUsers(users);
        return { success: true, message: 'Application rejected', user: user };
    },

    // Google Sign In - Handle JWT Token from Google
    loginWithGoogle: function (credential) {
        try {
            // Decode JWT token (simple base64 decode - in production use proper JWT library)
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleUser = JSON.parse(jsonPayload);
            const users = this.getUsers();

            // Check if user already exists
            let user = users.find(u => u.email === googleUser.email);

            if (user) {
                // User exists - update profile picture if available
                if (googleUser.picture && !user.profilePicture) {
                    user.profilePicture = googleUser.picture;
                    this.saveUsers(users);
                }

                // Set session and return
                this.setCurrentUser(user);
                return { success: true, user: user };
            } else {
                // New user - create account
                const newUser = {
                    id: Date.now(),
                    name: googleUser.name,
                    email: googleUser.email,
                    password: 'GOOGLE_AUTH_' + Date.now(), // Random password for Google users
                    role: 'student', // Default role
                    enrolledCourses: [],
                    profilePicture: googleUser.picture || null,
                    authProvider: 'google'
                };

                // Role assignment based on email (matching existing logic)
                if (googleUser.email.toLowerCase().includes('admin')) {
                    newUser.role = 'admin';
                }
                if (googleUser.email.toLowerCase().includes('teacher')) {
                    newUser.role = 'teacher';
                }

                users.push(newUser);
                this.saveUsers(users);
                this.setCurrentUser(newUser);

                return { success: true, user: newUser, isNewUser: true };
            }
        } catch (error) {
            console.error('Google Sign In Error:', error);
            return { success: false, message: 'Failed to process Google Sign In. Please try again.' };
        }
    },

    // Handle Google Callback Response
    handleGoogleCallback: function (response, requiredRole = null) {
        const result = this.loginWithGoogle(response.credential);

        if (result.success) {
            // If a specific role is required (for teacher/admin portals), validate it
            if (requiredRole) {
                if (result.user.role !== requiredRole && !(requiredRole === 'teacher' && result.user.role === 'admin')) {
                    // Admin can access everything, but others need correct role
                    this.logout();
                    return {
                        success: false,
                        message: `Access Denied: ${requiredRole} account required.`
                    };
                }
            }

            return result;
        }

        return result;
    }
};

// Auto-run UI update if on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateHeaderUI();
});
