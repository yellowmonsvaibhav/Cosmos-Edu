// Stripe Checkout Integration

// IMPORTANT: Replace with your actual Stripe publishable key
// Get it from: https://dashboard.stripe.com/test/apikeys
// For testing, you can use: pk_test_51QEXAMPLE_REPLACE_WITH_YOUR_KEY
// In production, use your actual key from Stripe Dashboard
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QEXAMPLE_REPLACE_WITH_YOUR_KEY';

// Demo mode flag - set to false when you have real Stripe keys
const DEMO_MODE = STRIPE_PUBLISHABLE_KEY.includes('EXAMPLE');

// Initialize Stripe
let stripe;
let elements;
let cardElement;

document.addEventListener('DOMContentLoaded', () => {
    // Get parameters from URL
    const params = new URLSearchParams(window.location.search);
    const courseId = parseInt(params.get('courseId'));
    const checkoutType = params.get('type');
    const planType = params.get('plan');
    const planPrice = parseFloat(params.get('price'));

    // Handle subscription checkout
    if (checkoutType === 'subscription' && planType && planPrice) {
        displaySubscriptionSummary(planType, planPrice);
        setupSubscriptionPayment(planType, planPrice);
        return;
    }

    // Handle course checkout
    if (!courseId) {
        window.location.href = 'index.html';
        return;
    }

    // Load course data
    const courses = JSON.parse(localStorage.getItem('udemyCourses')) || [];
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        window.location.href = 'index.html';
        return;
    }

    // Display course summary (no discount initially)
    let currentPrice = course.price;
    displayCourseSummary(course, currentPrice);

    // Coupon: apply and update price
    const couponCodeEl = document.getElementById('couponCode');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessageEl = document.getElementById('couponMessage');
    if (applyCouponBtn && couponCodeEl && typeof CourseUtils !== 'undefined') {
        applyCouponBtn.addEventListener('click', () => {
            const result = CourseUtils.applyCoupon(course.id, couponCodeEl.value);
            if (result.valid) {
                currentPrice = result.discountedPrice;
                displayCourseSummary(course, currentPrice);
                couponMessageEl.textContent = result.discount ? `Discount applied: ${result.discount}% off. New total updated above.` : 'Coupon applied.';
                couponMessageEl.style.color = 'var(--success, #10b981)';
            } else {
                couponMessageEl.textContent = result.message || 'Invalid coupon';
                couponMessageEl.style.color = '#ef4444';
            }
        });
    }

    // Initialize Stripe
    if (DEMO_MODE) {
        // Demo mode - show warning and demo payment
        showStripeWarning();
        setupDemoPayment(course);
    } else {
        initializeStripe(course);
    }

    // Update user name in nav
    const user = Auth.getCurrentUser();
    if (user) {
        document.getElementById('userNameNav').textContent = user.name;
    }
});

function displayCourseSummary(course, usePrice) {
    const summaryDiv = document.getElementById('courseSummary');
    const subtotal = usePrice != null ? usePrice : course.price;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    summaryDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 1.25rem; margin-bottom: 8px; color: var(--text-primary);">${course.title}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${course.instructor}</p>
        </div>
        <div class="course-summary-item">
            <span>Subtotal</span>
            <strong>$${subtotal.toFixed(2)}</strong>
        </div>
        <div class="course-summary-item">
            <span>Tax (10%)</span>
            <strong>$${tax.toFixed(2)}</strong>
        </div>
        <div class="course-summary-item">
            <span>Total</span>
            <strong>$${total.toFixed(2)}</strong>
        </div>
    `;
}

function initializeStripe(course) {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();

    // Create card element
    const style = {
        base: {
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#a1a1aa',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    };

    cardElement = elements.create('card', { style });
    cardElement.mount('#card-element');

    // Handle real-time validation errors
    cardElement.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Handle form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handlePayment(course);
    });
}

async function handlePayment(course) {
    const submitButton = document.getElementById('submit-btn');
    const buttonText = document.getElementById('button-text');
    
    // Disable button
    submitButton.disabled = true;
    buttonText.innerHTML = '<span class="loading"></span>Processing...';

    try {
        // In a real application, you would create a PaymentIntent on your server
        // For demo purposes, we'll simulate the payment flow
        
        // Simulate API call to your backend
        const paymentIntent = await createPaymentIntent(course);

        if (paymentIntent.error) {
            throw new Error(paymentIntent.error);
        }

        // Confirm payment with Stripe
        const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
            paymentIntent.clientSecret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: Auth.getCurrentUser().name,
                        email: Auth.getCurrentUser().email,
                    },
                },
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        // Payment successful
        if (confirmedPayment.status === 'succeeded') {
            // Enroll user in course
            enrollUserInCourse(course.id);
            
            // Show success message
            showSuccessMessage(course);
            
            // Redirect to course player after 2 seconds
            setTimeout(() => {
                window.location.href = `player.html?id=${course.id}`;
            }, 2000);
        }
    } catch (error) {
        // Show error
        showErrorMessage(error.message);
        
        // Re-enable button
        submitButton.disabled = false;
        buttonText.textContent = 'Pay Now';
    }
}

// Simulate creating a PaymentIntent
// In production, this should be done on your backend server
async function createPaymentIntent(course) {
    // This is a demo function - in production, make an API call to your backend
    // Example: const response = await fetch('/api/create-payment-intent', { ... });
    
    // For demo, we'll return a mock client secret
    // In production, replace this with actual API call
    
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // In production, you would get this from your backend
            // For demo, we'll use a test client secret format
            resolve({
                clientSecret: 'pi_test_client_secret_' + Date.now(),
                // In real app, this comes from your server
            });
        }, 500);
    });
}

function enrollUserInCourse(courseId) {
    const user = Auth.getCurrentUser();
    if (!user) return;

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
        }
    }
}

function showSuccessMessage(course) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 32px 48px;
        border-radius: var(--radius-xl);
        z-index: 3000;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
        animation: zoomIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 16px;">✓</div>
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Payment Successful!</h2>
        <p style="color: rgba(255, 255, 255, 0.9);">You've been enrolled in "${course.title}"</p>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 8px;">Redirecting to course...</p>
    `;
    document.body.appendChild(notification);
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('card-errors');
    errorDiv.textContent = message;
    errorDiv.style.color = '#ef4444';
    errorDiv.style.animation = 'shake 0.5s ease-in-out';
}

function displaySubscriptionSummary(planType, price) {
    const summaryDiv = document.getElementById('courseSummary');
    const planNames = {
        'basic': 'Basic Plan',
        'pro': 'Pro Plan',
        'enterprise': 'Enterprise Plan'
    };

    const subtotal = price;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    summaryDiv.innerHTML = `
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 1.25rem; margin-bottom: 8px; color: var(--text-primary);">${planNames[planType] || planType}</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Monthly subscription</p>
        </div>
        <div class="course-summary-item">
            <span>Monthly Plan</span>
            <strong>$${subtotal.toFixed(2)}</strong>
        </div>
        <div class="course-summary-item">
            <span>Tax (10%)</span>
            <strong>$${tax.toFixed(2)}</strong>
        </div>
        <div class="course-summary-item">
            <span>Total (per month)</span>
            <strong>$${total.toFixed(2)}</strong>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <p style="color: var(--text-secondary); font-size: 0.85rem;">You'll be charged monthly. Cancel anytime.</p>
        </div>
    `;

    // Update header
    document.querySelector('.checkout-header h1').textContent = 'Subscribe to Cosmos';
    document.querySelector('.checkout-header p').textContent = 'Get unlimited access to all courses';
}

function setupSubscriptionPayment(planType, price) {
    if (DEMO_MODE) {
        showStripeWarning();
        setupDemoSubscription(planType, price);
    } else {
        initializeStripe({ id: planType, price: price, title: planType + ' Plan' });
    }
}

async function handleDemoSubscription(planType, price) {
    const submitButton = document.getElementById('submit-btn');
    const buttonText = document.getElementById('button-text');
    
    submitButton.disabled = true;
    buttonText.innerHTML = '<span class="loading"></span>Processing...';

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Activate subscription
    activateSubscription(planType, price);
    showSubscriptionSuccess(planType);
    
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 2000);
}

function activateSubscription(planType, price) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('udemyUsers')) || [];
    const userIndex = users.findIndex(u => u.email === user.email);

    if (userIndex !== -1) {
        users[userIndex].subscription = {
            plan: planType,
            price: price,
            status: 'active',
            startDate: new Date().toISOString(),
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        localStorage.setItem('udemyUsers', JSON.stringify(users));

        // Update current user session
        const updatedUser = { ...user, subscription: users[userIndex].subscription };
        Auth.setCurrentUser(updatedUser);
    }
}

function showSubscriptionSuccess(planType) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(16, 185, 129, 0.95);
        color: white;
        padding: 32px 48px;
        border-radius: var(--radius-xl);
        z-index: 3000;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
        animation: zoomIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 16px;">✓</div>
        <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Subscription Activated!</h2>
        <p style="color: rgba(255, 255, 255, 0.9);">You now have access to ${planType} plan features</p>
        <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 8px;">Redirecting to profile...</p>
    `;
    document.body.appendChild(notification);
}

function showStripeWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        background: rgba(251, 191, 36, 0.1);
        border: 2px solid rgba(251, 191, 36, 0.3);
        border-radius: var(--radius-md);
        padding: 20px;
        margin-bottom: 24px;
        color: #fbbf24;
    `;
    warning.innerHTML = `
        <strong>⚠️ Demo Mode - Stripe Integration Required</strong>
        <p style="margin-top: 8px; font-size: 0.9rem;">
            Currently in demo mode. To enable real payments:
            <ol style="margin-top: 8px; padding-left: 20px; font-size: 0.85rem;">
                <li>Get your Stripe API keys from <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" style="color: #fbbf24; text-decoration: underline;">Stripe Dashboard</a></li>
                <li>Replace STRIPE_PUBLISHABLE_KEY in checkout.js with your publishable key</li>
                <li>Set up a backend endpoint to create PaymentIntents</li>
            </ol>
            <p style="margin-top: 12px; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
                <strong>Demo Mode:</strong> Click "Pay Now" to simulate a successful payment and enroll in the course.
            </p>
        </p>
    `;
    document.querySelector('.checkout-card').insertBefore(warning, document.getElementById('payment-form'));
}

function setupDemoPayment(course) {
    // Hide Stripe card element in demo mode
    document.getElementById('card-element').style.display = 'none';
    document.querySelector('.form-group label').textContent = 'Demo Payment';
    
    // Add demo info
    const demoInfo = document.createElement('div');
    demoInfo.style.cssText = `
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: var(--radius-md);
        padding: 16px;
        margin-bottom: 24px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    `;
    demoInfo.innerHTML = `
        <strong style="color: var(--text-primary);">Demo Payment</strong>
        <p style="margin-top: 8px;">In demo mode, clicking "Pay Now" will simulate a successful payment and enroll you in the course.</p>
    `;
    document.getElementById('payment-form').insertBefore(demoInfo, document.getElementById('submit-btn'));

    // Handle form submission for demo
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleDemoPayment(course);
    });
}

function setupDemoSubscription(planType, price) {
    // Hide Stripe card element in demo mode
    document.getElementById('card-element').style.display = 'none';
    document.querySelector('.form-group label').textContent = 'Demo Payment';
    
    // Add demo info
    const demoInfo = document.createElement('div');
    demoInfo.style.cssText = `
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: var(--radius-md);
        padding: 16px;
        margin-bottom: 24px;
        color: var(--text-secondary);
        font-size: 0.9rem;
    `;
    demoInfo.innerHTML = `
        <strong style="color: var(--text-primary);">Demo Payment</strong>
        <p style="margin-top: 8px;">In demo mode, clicking "Pay Now" will activate your subscription.</p>
    `;
    document.getElementById('payment-form').insertBefore(demoInfo, document.getElementById('submit-btn'));

    // Handle form submission for demo
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await handleDemoSubscription(planType, price);
    });
}

async function handleDemoPayment(course) {
    const submitButton = document.getElementById('submit-btn');
    const buttonText = document.getElementById('button-text');
    
    // Disable button
    submitButton.disabled = true;
    buttonText.innerHTML = '<span class="loading"></span>Processing...';

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment
    enrollUserInCourse(course.id);
    showSuccessMessage(course);
    
    // Redirect to course player after 2 seconds
    setTimeout(() => {
        window.location.href = `player.html?id=${course.id}`;
    }, 2000);
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
