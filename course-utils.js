// Course Utilities - Enhanced Course Management System

const CourseUtils = {
    // Enhanced Course Data Structure
    COURSES_KEY: 'udemyCourses',
    PROGRESS_KEY: 'udemyProgress',
    REVIEWS_KEY: 'udemyReviews',
    WISHLIST_KEY: 'udemyWishlist',
    QUESTIONS_KEY: 'udemyQuestions',
    CERTIFICATES_KEY: 'udemyCertificates',
    REFUNDS_KEY: 'udemyRefunds',
    COUPONS_KEY: 'udemyCoupons',

    // Get all courses
    getCourses: function() {
        return JSON.parse(localStorage.getItem(this.COURSES_KEY)) || [];
    },

    // Save courses
    saveCourses: function(courses) {
        localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    },

    // Get course by ID
    getCourseById: function(id) {
        const courses = this.getCourses();
        return courses.find(c => c.id === parseInt(id));
    },

    // Enhanced course structure
    createCourse: function(data) {
        return {
            id: data.id || Date.now(),
            title: data.title,
            description: data.description || '',
            shortDescription: data.shortDescription || '',
            img: data.img,
            category: data.category,
            subcategory: data.subcategory || '',
            instructor: data.instructor,
            instructorId: data.instructorId,
            rating: data.rating || 0,
            ratingCount: data.ratingCount || 0,
            students: data.students || 0,
            price: data.price || 0,
            originalPrice: data.originalPrice || data.price,
            level: data.level || 'Beginner', // Beginner, Intermediate, Advanced
            language: data.language || 'English',
            duration: data.duration || 0, // Total minutes
            lectures: data.lectures || 0,
            resources: data.resources || 0,
            bestseller: data.bestseller || false,
            featured: data.featured || false,
            status: data.status || 'draft', // draft, pending, approved, published, rejected
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            publishedAt: data.publishedAt || null,
            curriculum: data.curriculum || [], // Sections with lessons
            learningObjectives: data.learningObjectives || [],
            requirements: data.requirements || [],
            tags: data.tags || [],
            couponCode: data.couponCode || null,
            discountPercent: data.discountPercent || 0,
            link: `player.html?id=${data.id || Date.now()}`,
            // Metadata
            videoPreview: data.videoPreview || '',
            thumbnail: data.thumbnail || data.img,
            whatYouWillLearn: data.whatYouWillLearn || [],
            targetAudience: data.targetAudience || ''
        };
    },

    // Progress Tracking
    getProgress: function(userId, courseId) {
        const progress = JSON.parse(localStorage.getItem(this.PROGRESS_KEY)) || {};
        const key = `${userId}_${courseId}`;
        return progress[key] || {
            courseId: courseId,
            userId: userId,
            enrolledAt: new Date().toISOString(),
            lastAccessedAt: null,
            lastLesson: null,
            completedLessons: [],
            completedSections: [],
            progressPercent: 0,
            totalTimeSpent: 0, // minutes
            completed: false,
            completedAt: null
        };
    },

    saveProgress: function(userId, courseId, progressData) {
        const progress = JSON.parse(localStorage.getItem(this.PROGRESS_KEY)) || {};
        const key = `${userId}_${courseId}`;
        progress[key] = {
            ...this.getProgress(userId, courseId),
            ...progressData,
            lastAccessedAt: new Date().toISOString()
        };
        localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    },

    markLessonComplete: function(userId, courseId, sectionIndex, lessonIndex) {
        const course = this.getCourseById(courseId);
        if (!course) return;

        const progress = this.getProgress(userId, courseId);
        const lessonKey = `${sectionIndex}_${lessonIndex}`;
        
        if (!progress.completedLessons.includes(lessonKey)) {
            progress.completedLessons.push(lessonKey);
        }

        // Check if section is complete
        const section = course.curriculum[sectionIndex];
        if (section && section.lessons) {
            const allLessonsComplete = section.lessons.every((_, idx) => 
                progress.completedLessons.includes(`${sectionIndex}_${idx}`)
            );
            
            if (allLessonsComplete && !progress.completedSections.includes(sectionIndex)) {
                progress.completedSections.push(sectionIndex);
            }
        }

        // Calculate overall progress
        const totalLessons = course.curriculum.reduce((sum, section) => 
            sum + (section.lessons ? section.lessons.length : 0), 0
        );
        progress.progressPercent = Math.round((progress.completedLessons.length / totalLessons) * 100);

        // Check if course is complete
        if (progress.progressPercent === 100 && !progress.completed) {
            progress.completed = true;
            progress.completedAt = new Date().toISOString();
            this.generateCertificate(userId, courseId);
        }

        this.saveProgress(userId, courseId, progress);
    },

    updateLastLesson: function(userId, courseId, sectionIndex, lessonIndex) {
        this.saveProgress(userId, courseId, {
            lastLesson: { sectionIndex, lessonIndex }
        });
    },

    // Reviews & Ratings
    getReviews: function(courseId) {
        const reviews = JSON.parse(localStorage.getItem(this.REVIEWS_KEY)) || [];
        return reviews.filter(r => r.courseId === courseId && r.status === 'approved');
    },

    addReview: function(courseId, userId, userName, rating, comment) {
        const reviews = JSON.parse(localStorage.getItem(this.REVIEWS_KEY)) || [];
        const newReview = {
            id: Date.now(),
            courseId: courseId,
            userId: userId,
            userName: userName,
            rating: rating,
            comment: comment,
            status: 'approved', // or 'pending' for admin review
            createdAt: new Date().toISOString(),
            helpful: 0,
            reported: false
        };
        reviews.push(newReview);
        localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(reviews));

        // Update course rating
        this.updateCourseRating(courseId);
    },

    updateCourseRating: function(courseId) {
        const reviews = this.getReviews(courseId);
        if (reviews.length === 0) return;

        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const courses = this.getCourses();
        const courseIndex = courses.findIndex(c => c.id === courseId);
        
        if (courseIndex !== -1) {
            courses[courseIndex].rating = Math.round(avgRating * 10) / 10;
            courses[courseIndex].ratingCount = reviews.length;
            this.saveCourses(courses);
        }
    },

    // Wishlist
    getWishlist: function(userId) {
        const wishlist = JSON.parse(localStorage.getItem(this.WISHLIST_KEY)) || {};
        return wishlist[userId] || [];
    },

    addToWishlist: function(userId, courseId) {
        const wishlist = JSON.parse(localStorage.getItem(this.WISHLIST_KEY)) || {};
        if (!wishlist[userId]) wishlist[userId] = [];
        if (!wishlist[userId].includes(courseId)) {
            wishlist[userId].push(courseId);
            localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlist));
        }
    },

    removeFromWishlist: function(userId, courseId) {
        const wishlist = JSON.parse(localStorage.getItem(this.WISHLIST_KEY)) || {};
        if (wishlist[userId]) {
            wishlist[userId] = wishlist[userId].filter(id => id !== courseId);
            localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(wishlist));
        }
    },

    isInWishlist: function(userId, courseId) {
        const wishlist = this.getWishlist(userId);
        return wishlist.includes(courseId);
    },

    // Q&A / Discussions
    getQuestions: function(courseId) {
        const questions = JSON.parse(localStorage.getItem(this.QUESTIONS_KEY)) || [];
        return questions.filter(q => q.courseId === courseId);
    },

    addQuestion: function(courseId, userId, userName, question) {
        const questions = JSON.parse(localStorage.getItem(this.QUESTIONS_KEY)) || [];
        const newQuestion = {
            id: Date.now(),
            courseId: courseId,
            userId: userId,
            userName: userName,
            question: question,
            answers: [],
            createdAt: new Date().toISOString(),
            upvotes: 0
        };
        questions.push(newQuestion);
        localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
        return newQuestion;
    },

    addAnswer: function(questionId, userId, userName, answer, isInstructor = false) {
        const questions = JSON.parse(localStorage.getItem(this.QUESTIONS_KEY)) || [];
        const questionIndex = questions.findIndex(q => q.id === questionId);
        
        if (questionIndex !== -1) {
            if (!questions[questionIndex].answers) {
                questions[questionIndex].answers = [];
            }
            questions[questionIndex].answers.push({
                id: Date.now(),
                userId: userId,
                userName: userName,
                answer: answer,
                isInstructor: isInstructor,
                createdAt: new Date().toISOString(),
                upvotes: 0
            });
            localStorage.setItem(this.QUESTIONS_KEY, JSON.stringify(questions));
        }
    },

    // Certificates
    generateCertificate: function(userId, courseId) {
        const certificates = JSON.parse(localStorage.getItem(this.CERTIFICATES_KEY)) || [];
        const course = this.getCourseById(courseId);
        const user = Auth.getCurrentUser();
        
        if (!course || !user) return null;

        const certificate = {
            id: Date.now(),
            userId: userId,
            courseId: courseId,
            courseTitle: course.title,
            userName: user.name,
            issuedAt: new Date().toISOString(),
            certificateNumber: `COSMOS-${Date.now()}-${courseId}`
        };

        certificates.push(certificate);
        localStorage.setItem(this.CERTIFICATES_KEY, JSON.stringify(certificates));
        return certificate;
    },

    getCertificates: function(userId) {
        const certificates = JSON.parse(localStorage.getItem(this.CERTIFICATES_KEY)) || [];
        return certificates.filter(c => c.userId === userId);
    },

    // Search & Filter
    searchCourses: function(query, filters = {}) {
        let courses = this.getCourses().filter(c => (c.status || 'published') === 'published');

        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            courses = courses.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                (course.description || course.desc || '').toLowerCase().includes(searchTerm) ||
                course.instructor.toLowerCase().includes(searchTerm) ||
                (course.tags && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // Category filter
        if (filters.category && filters.category !== 'all') {
            courses = courses.filter(c => c.category === filters.category);
        }

        // Price filter
        if (filters.price) {
            if (filters.price === 'free') {
                courses = courses.filter(c => c.price === 0);
            } else if (filters.price === 'paid') {
                courses = courses.filter(c => c.price > 0);
            } else if (filters.price === 'under50') {
                courses = courses.filter(c => c.price > 0 && c.price < 50);
            } else if (filters.price === '50-100') {
                courses = courses.filter(c => c.price >= 50 && c.price <= 100);
            } else if (filters.price === 'over100') {
                courses = courses.filter(c => c.price > 100);
            }
        }

        // Rating filter
        if (filters.minRating) {
            courses = courses.filter(c => c.rating >= filters.minRating);
        }

        // Level filter
        if (filters.level && filters.level !== 'all') {
            courses = courses.filter(c => (c.level || 'Beginner') === filters.level);
        }

        // Sort
        if (filters.sort) {
            switch(filters.sort) {
                case 'rating':
                    courses.sort((a, b) => b.rating - a.rating);
                    break;
                case 'students':
                    courses.sort((a, b) => b.students - a.students);
                    break;
                case 'price-low':
                    courses.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    courses.sort((a, b) => b.price - a.price);
                    break;
                case 'newest':
                    courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    break;
            }
        }

        return courses;
    },

    // Coupon System (per-course + global admin coupons)
    applyCoupon: function(courseId, couponCode) {
        const course = this.getCourseById(courseId);
        if (!course) return { valid: false, message: 'Course not found' };
        const code = (couponCode || '').trim().toLowerCase();
        if (!code) return { valid: false, message: 'Enter a coupon code' };

        // Per-course coupon
        if (course.couponCode && course.couponCode.toLowerCase() === code) {
            const discount = course.discountPercent || 0;
            const discountedPrice = course.price * (1 - discount / 100);
            return { valid: true, discount: discount, originalPrice: course.price, discountedPrice: Math.round(discountedPrice * 100) / 100 };
        }

        // Global coupons (admin-created)
        const coupons = JSON.parse(localStorage.getItem(this.COUPONS_KEY)) || [];
        const coupon = coupons.find(c => c.code.toLowerCase() === code && (c.courseId == null || c.courseId === courseId));
        if (coupon) {
            const discount = coupon.discountPercent || 0;
            const discountedPrice = course.price * (1 - discount / 100);
            return { valid: true, discount: discount, originalPrice: course.price, discountedPrice: Math.round(discountedPrice * 100) / 100 };
        }

        return { valid: false, message: 'Invalid coupon code' };
    },

    getCoupons: function() {
        return JSON.parse(localStorage.getItem(this.COUPONS_KEY)) || [];
    },

    saveCoupon: function(coupon) {
        const coupons = this.getCoupons();
        coupons.push({ id: Date.now(), ...coupon, createdAt: new Date().toISOString() });
        localStorage.setItem(this.COUPONS_KEY, JSON.stringify(coupons));
    },

    // Refunds
    getRefunds: function() {
        return JSON.parse(localStorage.getItem(this.REFUNDS_KEY)) || [];
    },

    requestRefund: function(userId, userEmail, courseId, reason) {
        const refunds = this.getRefunds();
        refunds.push({
            id: Date.now(),
            userId, userEmail, courseId, reason,
            status: 'pending',
            createdAt: new Date().toISOString(),
            resolvedAt: null
        });
        localStorage.setItem(this.REFUNDS_KEY, JSON.stringify(refunds));
    },

    resolveRefund: function(refundId, approved) {
        const refunds = this.getRefunds();
        const i = refunds.findIndex(r => r.id === refundId);
        if (i !== -1) {
            refunds[i].status = approved ? 'approved' : 'rejected';
            refunds[i].resolvedAt = new Date().toISOString();
            localStorage.setItem(this.REFUNDS_KEY, JSON.stringify(refunds));
        }
    }
};
