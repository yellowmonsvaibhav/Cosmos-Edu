// Subscription Management

document.addEventListener('DOMContentLoaded', () => {
    const user = Auth.getCurrentUser();
    if (user) {
        document.getElementById('userNameNav').textContent = user.name;
        loadUserSubscription(user);
    }
});

function selectPlan(planType, price) {
    const user = Auth.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect to checkout with subscription details
    window.location.href = `checkout.html?type=subscription&plan=${planType}&price=${price}`;
}

function loadUserSubscription(user) {
    // Check if user has active subscription
    const subscription = user.subscription || null;
    
    if (subscription) {
        // Show current plan badge
        showCurrentPlan(subscription);
    }
}

function showCurrentPlan(subscription) {
    // Add indicator showing current plan
    const plans = document.querySelectorAll('.plan-card');
    plans.forEach(plan => {
        const planName = plan.querySelector('.plan-name').textContent.toLowerCase();
        if (planName === subscription.plan) {
            const button = plan.querySelector('.plan-button');
            button.textContent = 'Current Plan';
            button.disabled = true;
            button.style.opacity = '0.6';
            button.style.cursor = 'not-allowed';
        }
    });
}

// Handle subscription checkout
if (window.location.search.includes('type=subscription')) {
    // This will be handled in checkout.js
}
