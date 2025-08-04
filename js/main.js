import { initializeFirebase, loginWithGoogle, loginWithKey, logout, auth } from './auth.js';
import { updateCartUI, showAddToCartNotification, renderCartPage } from './ui.js';

// Global variables
let currentCartKey = 'cart_guest'; // Default cart key for guests
let cartReady = true; // Cart should be ready immediately for guests

// Cart functions
function getCart() {
    const cart = JSON.parse(localStorage.getItem(currentCartKey) || '[]');
    return cart;
}

function setCart(cart) {
    localStorage.setItem(currentCartKey, JSON.stringify(cart));
    console.log('[setCart] key:', currentCartKey, 'cart:', cart);
    updateCartUI();
}

function addToCart(name, price, qty) {
    console.log('[addToCart] Adding:', name, price, qty, 'to key:', currentCartKey);
    const cart = getCart();
    const idx = cart.findIndex(item => item.name === name && item.price === price);
    if (idx !== -1) {
        cart[idx].qty += qty;
    } else {
        cart.push({ name, price, qty });
    }
    setCart(cart);
    showAddToCartNotification(name);
}

function changeCartItemQty(index, delta) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        setCart(cart);
    }
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
}

function clearCart() {
    setCart([]);
}

function setCartKey(key) {
    currentCartKey = key;
    cartReady = true;
    console.log('[setCartKey] Cart ready with key:', key);
}

// UI functions
function showLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        console.log('[showLoginOverlay] Login overlay displayed.');
    }
}

function hideLoginOverlay() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        console.log('[hideLoginOverlay] Login overlay hidden.');
    }
}

function updateUserGreeting(user) {
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

// Typewriter function
function typeWriter(element, text, speed = 60, callback) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
    console.log('[DOMContentLoaded] Starting initialization');

    // Make functions globally accessible
    Object.assign(window, {
        loginWithGoogle,
        loginWithKey,
        logout,
        showLoginOverlay,
        hideLoginOverlay,
        updateUserGreeting,
        addToCart,
        getCart,
        setCart,
        clearCart,
        changeCartItemQty,
        removeCartItem,
        renderCartPage,
        setCartKey
    });

    // Initialize typewriter effect on home page
    const header = document.getElementById('typewriter-header');
    const desc = document.getElementById('typewriter-desc');
    if (header && desc) {
        header.innerHTML = '';
        desc.innerHTML = '';
        typeWriter(header, 'Welcome To Cartel Cheats', 90, () => {
            setTimeout(() => {
                typeWriter(desc, 'Buy Undetected Cheats Here! Top Quality And Frequently Updated Products! Browse Our Options Below!', 50);
            }, 500);
        });
    }

    // Initialize Firebase
    try {
        await initializeFirebase();
        console.log('[DOMContentLoaded] Firebase initialized successfully');
    } catch (error) {
        console.error('[DOMContentLoaded] Firebase initialization failed:', error);
    }

    // Initialize cart UI
    updateCartUI();
    
    console.log('[DOMContentLoaded] Initialization complete');
});