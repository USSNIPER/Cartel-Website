import { getCart } from './main.js';

export function showLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        console.log('[showLoginOverlay] Login overlay displayed.');
    }
}

export function hideLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log('[hideLoginOverlay] Login overlay hidden.');
    }
}

export function updateUserGreeting(user) {
    const area = document.getElementById('user-greeting-area');
    const greeting = document.getElementById('user-greeting');
    if (user && area && greeting) {
        greeting.textContent = `Hello, ${user.displayName || user.email || 'User'}!`;
        area.style.display = 'flex';
        console.log('[updateUserGreeting] User greeting updated for:', user.displayName || user.email);
    } else if (area) {
        greeting.textContent = '';
        area.style.display = 'none';
        console.log('[updateUserGreeting] User greeting hidden.');
    }
}

export function updateCartUI() {
    updateCartCount();
    if (window.location.pathname.endsWith('cart.html')) {
        renderCartPage();
    }
}

export function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const el = document.getElementById('cart-count');
    if (el) {
        el.textContent = count;
    }
}

export function showAddToCartNotification(productName) {
    let notif = document.createElement('div');
    notif.textContent = `Added to cart: ${productName}`;
    notif.style.position = 'fixed';
    notif.style.top = '24px';
    notif.style.right = '24px';
    notif.style.background = 'linear-gradient(90deg,#00ffd0,#7b5fff)';
    notif.style.color = '#181828';
    notif.style.fontWeight = 'bold';
    notif.style.padding = '1rem 2rem';
    notif.style.borderRadius = '1.5rem';
    notif.style.boxShadow = '0 2px 16px #00ffd0a0';
    notif.style.zIndex = 99999;
    notif.style.fontSize = '1.1rem';
    notif.style.opacity = '0.95';
    notif.style.transition = 'opacity 0.3s';
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 400);
    }, 1200);
}

export function renderCartPage() {
    console.log('[renderCartPage] Starting cart page render');
    const cart = getCart();
    console.log('[renderCartPage] Got cart:', cart);
    const cartItemsContainer = document.getElementById('cart-page-items');
    const cartPageTotal = document.getElementById('cart-page-total');
    const finalTotal = document.getElementById('final-total');

    if (!cartItemsContainer) {
        console.log('[renderCartPage] ERROR: cart-page-items container not found');
        return;
    }

    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        if (cartPageTotal) cartPageTotal.textContent = '$0.00';
        if (finalTotal) finalTotal.textContent = '$0.00';
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn minus-btn" aria-label="Decrease quantity">
                    <svg width="16" height="2" viewBox="0 0 16 2"><rect width="16" height="2" rx="1" fill="currentColor"/></svg>
                </button>
                <span class="qty-text">${item.qty}</span>
                <button class="qty-btn plus-btn" aria-label="Increase quantity">
                    <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 0C8.55228 0 9 0.447715 9 1V7H15C15.5523 7 16 7.44772 16 8C16 8.55228 15.5523 9 15 9H9V15C9 15.5523 8.55228 16 8 16C7.44772 16 7 15.5523 7 15V9H1C0.447715 9 0 8.55228 0 8C0 7.44772 0.447715 7 1 7H7V1C7 0.447715 7.44772 0 8 0Z" fill="currentColor"/></svg>
                </button>
            </div>
            <button class="remove-item-btn" aria-label="Remove item">
                <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.7071 1.70711C18.0976 1.31658 18.0976 0.683417 17.7071 0.292893C17.3166 -0.0976311 16.6834 -0.0976311 16.2929 0.292893L9 7.58579L1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L7.58579 9L0.292893 16.2929C-0.0976311 16.6834 -0.0976311 17.3166 0.292893 17.7071C0.683417 18.0976 1.31658 18.0976 1.70711 17.7071L9 10.4142L16.2929 17.7071C16.6834 18.0976 17.3166 18.0976 17.7071 17.7071C18.0976 17.3166 18.0976 16.6834 17.7071 16.2929L10.4142 9L17.7071 1.70711Z" fill="currentColor"/></svg>
            </button>
        `;

        // Add event listeners to the buttons
        const minusBtn = itemElement.querySelector('.minus-btn');
        const plusBtn = itemElement.querySelector('.plus-btn');
        const removeBtn = itemElement.querySelector('.remove-item-btn');

        minusBtn.addEventListener('click', () => {
            changeCartItemQty(index, -1);
            renderCartPage();
        });

        plusBtn.addEventListener('click', () => {
            changeCartItemQty(index, 1);
            renderCartPage();
        });

        removeBtn.addEventListener('click', () => {
            removeCartItem(index);
            renderCartPage();
        });

        cartItemsContainer.appendChild(itemElement);
    });

    if (cartPageTotal) cartPageTotal.textContent = `$${total.toFixed(2)}`;
    if (finalTotal) finalTotal.textContent = `$${total.toFixed(2)}`;

    // Initialize PayPal button with confirmation redirect
    if (window.paypal && cart.length > 0) {
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
            paypalContainer.innerHTML = ''; // Clear existing buttons
            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'blue',
                    shape: 'pill',
                    label: 'pay'
                },
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: total.toFixed(2),
                                currency_code: "USD"
                            },
                            description: "Cartel Cheats Purchase"
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        // Get cart data before clearing
                        const cart = window.getCart();
                        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                        
                        const orderData = {
                            items: cart.map(item => ({
                                name: item.name,
                                price: item.price,
                                quantity: item.qty
                            })),
                            total: total,
                            timestamp: new Date().toISOString(),
                            paypalOrderId: data.orderID
                        };
                        
                        // Clear the cart
                        window.clearCart();
                        
                        // Redirect to confirmation page
                        const orderDataParam = encodeURIComponent(JSON.stringify(orderData));
                        window.location.href = `confirmation.html?orderData=${orderDataParam}`;
                    });
                }
            }).render('#paypal-button-container');
        }
    }
}