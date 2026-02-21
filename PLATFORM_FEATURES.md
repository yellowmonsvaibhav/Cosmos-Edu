# Cosmos – Udemy-like Platform – Feature Overview

## Implemented (MVP + Core)

### Students
- **Sign up / Login** – Email-based auth (no Google OAuth yet).
- **Browse courses** – Homepage with categories: Programming, Data Science, Design.
- **Search** – Search by title, description, instructor.
- **Course landing page** (`course.html?id=X`) – Full details, curriculum preview, instructor, price, CTA.
- **Purchase** – Checkout with Stripe (demo mode supported), enrollment stored in `udemyUsers`.
- **Watch lessons** – Video player with YouTube and direct MP4 support.
- **Progress** – Resume where you left off; last lesson stored per user/course.
- **Mark complete** – “Mark as complete” in player; progress % and completion tracked.
- **Certificate** – Auto-generated when course is 100% complete; listed on Profile.
- **Reviews & ratings** – Enrolled students can leave rating + comment on course page; course rating updates.
- **Wishlist** – Heart icon on cards (logged-in); add/remove from wishlist; persisted per user.

### Instructors
- **Login** – Teacher login; instructor application flow (instructor-signup).
- **Create course** – Title, image, category, price/free, description, curriculum (sections + lessons with URLs).
- **Curriculum** – Text format: section title, then `-- Lesson title | video URL` per line.
- **My courses** – List/delete own courses in teacher dashboard.

### Admin
- **Dashboard** – Stats (courses, users, revenue, rating).
- **Course management** – List courses, add (modal), delete.
- **User management** – List users, courses enrolled, remove user.
- **Instructor applications** – Approve/reject; view documents.

### Payments & Pricing
- **Course purchase** – Stripe Elements on `checkout.html`; demo mode for testing without backend.
- **Subscription** – Subscription plans page + checkout flow (demo); stored on user.
- **Coupon** – Logic in `course-utils.js` (`applyCoupon`); not yet wired into checkout UI.

### Data & Code
- **`course-utils.js`** – Central helpers: courses, progress, reviews, wishlist, Q&A, certificates, search/filter, coupons.
- **Progress** – `udemyProgress` in localStorage: per user/course last lesson, completed lessons, % and completion flag.
- **Certificates** – `udemyCertificates` in localStorage; generated when progress hits 100%.

---

## Not Yet Implemented (From Spec)

- **Google login** – Only email/password.
- **Course resources download** – No PDF/file downloads.
- **Q&A/Discussions** – Data model and helpers in `course-utils.js`; no UI in player/course page yet.
- **Advanced search filters** – Price, rating, duration, level (helpers in `CourseUtils.searchCourses`); filters not on homepage.
- **Instructor analytics** – No sales/earnings dashboard.
- **Coupon at checkout** – Coupon field and `applyCoupon` not connected in `checkout.html`.
- **Refunds** – No admin refund flow.
- **Course approval workflow** – No “pending review” / approve-reject before course is “published”; all courses treated as published.
- **Categories/tags management** – No admin UI to manage categories/tags.

---

## How to Run

1. Open `index.html` in a browser (or use a local server, e.g. `npx serve`).
2. **Student:** Sign up → browse → open a course → enroll (free) or buy → watch in player → mark complete → see progress and certificate on Profile.
3. **Instructor:** Log in as `teacher@cosmos.com` / `teacher` → create course with curriculum → students see it on homepage.
4. **Admin:** Log in as `admin@cosmos.com` / `admin` → manage courses, users, applications.

---

## File Reference

| File | Purpose |
|------|--------|
| `course-utils.js` | Course data, progress, reviews, wishlist, Q&A, certificates, search, coupons |
| `course.html` | Course landing page (preview, curriculum, reviews, wishlist, enroll/buy) |
| `player.html` | Video player, curriculum list, progress, mark complete, certificate link |
| `script.js` | Homepage: render courses, search, enroll, wishlist button |
| `profile.js` | Profile: enrolled courses (real progress), certificates list, stats |
| `checkout.js` | Stripe payment, enrollment, subscription |
| `auth.js` | Login, register, roles, header UI |
| `teacher.js` | Create course, curriculum parser, my courses |
| `admin.js` | Dashboard, courses, users, instructor applications |
