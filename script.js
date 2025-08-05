console.log('script.js loaded and executing');

// Typewriter function with cursor effect
function typeWriter(element, text, speed = 80, callback) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
            i++;
            setTimeout(type, speed);
        } else {
            element.innerHTML = text; // Remove cursor when done
            if (callback) {
                setTimeout(callback, 300);
            }
        }
    }
    type();
}

// Global variables
let auth = null;
let provider = null;
let app = null;
let currentCartKey = 'cart_guest'; // Default cart key
let cartReady = false;

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

// Initialize Firebase when the page loads
async function initializeFirebase() {
  console.log('[initializeFirebase] Function called');
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js");
    const { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js");

    const firebaseConfig = {
      apiKey: "AIzaSyAyC6mxNHZ_lNNZXb6YngZdFFf3d6LdIWQ",
      authDomain: "cartel-cheats.firebaseapp.com",
      projectId: "cartel-cheats",
      storageBucket: "cartel-cheats.firebasestorage.app",
      messagingSenderId: "290099986212",
      appId: "1:290099986212:web:f5a155d59f083d47cb3db1",
      measurementId: "G-FEB19T0SJE"
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    setPersistence(auth, browserLocalPersistence);
    console.log('[initializeFirebase] Firebase app and auth initialized.');

    // Set up auth state listener
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js");
    onAuthStateChanged(auth, user => {
      console.log('[onAuthStateChanged] Auth state changed. User:', user);
      if (user) {
        // Migrate guest cart if needed
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
        const userCartKey = `cart_${user.uid}`;
        const userCart = JSON.parse(localStorage.getItem(userCartKey) || '[]');
        if (guestCart.length > 0 && userCart.length === 0) {
          localStorage.setItem(userCartKey, JSON.stringify(guestCart));
          localStorage.removeItem('cart_guest');
          console.log('[MIGRATE] guest_cart ->', userCartKey, guestCart);
        }
        currentCartKey = userCartKey;
        // Update the cart key in main.js
        if (window.setCartKey) {
          window.setCartKey(currentCartKey);
        }

        // Check if user has a saved username
        const savedUsername = localStorage.getItem(`username_${user.uid}`);
        if (savedUsername) {
          console.log('[onAuthStateChanged] User has saved username:', savedUsername);
          hideLoginOverlay();
          updateUserGreeting({ ...user, displayName: savedUsername });
        } else {
          console.log('[onAuthStateChanged] User has no saved username, showing nickname setup.');
          // Show nickname setup overlay
          document.getElementById('login-overlay').style.display = 'none';
          document.getElementById('nickname-overlay').style.display = 'flex';
        }
      } else {
        console.log('[onAuthStateChanged] No user logged in.');
        // Check if there's a key user logged in
        const keyUser = localStorage.getItem('key_user');
        if (keyUser) {
          const parsedKeyUser = JSON.parse(keyUser);
          currentCartKey = `cart_${parsedKeyUser.uid}`;
          // Update the cart key in main.js
          if (window.setCartKey) {
            window.setCartKey(currentCartKey);
          }
          hideLoginOverlay();
          updateUserGreeting(parsedKeyUser);
        } else {
          currentCartKey = 'cart_guest';
          // Update the cart key in main.js
          if (window.setCartKey) {
            window.setCartKey(currentCartKey);
          }
          showLoginOverlay(); // Show login overlay if no user (Firebase or key) is logged in
          updateUserGreeting(null);
        }
      }
      cartReady = true;
      console.log('[AUTH] Current cart key:', currentCartKey, 'cartReady:', cartReady);
      updateCartUI();
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // FALLBACK: Set cart ready even if Firebase fails
    console.log('[FALLBACK] Firebase failed, using guest cart');
    currentCartKey = 'cart_guest';
    cartReady = true;
    updateCartUI();
  }
}

// FALLBACK TIMEOUT: Ensure cart is always ready within 3 seconds
setTimeout(() => {
  if (!cartReady) {
    console.log('[TIMEOUT] Cart not ready after 3s, forcing ready state');
    currentCartKey = 'cart_guest';
    cartReady = true;
    updateCartUI();
  }
}, 3000);

// BULLETPROOF CART FUNCTIONS
function getCart() {
  if (!cartReady) return [];
  const cart = JSON.parse(localStorage.getItem(currentCartKey) || '[]');
  console.log('[getCart] key:', currentCartKey, 'cart:', cart);
  return cart;
}

function setCart(cart) {
  if (!cartReady) return;
  localStorage.setItem(currentCartKey, JSON.stringify(cart));
  console.log('[setCart] key:', currentCartKey, 'cart:', cart);
  updateCartUI();
}

function updateCartUI() {
  if (!cartReady) return;
  updateCartCount();
  if (window.location.pathname === '/cart') {
    renderCartPage();
  }
}

function updateCartCount() {
  if (!cartReady) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = count;
  }
}

// DELETE THIS SECTION (addToCart function)
function addToCart(name, price, qty) {
  if (!cartReady) {
      setTimeout(() => addToCart(name, price, qty), 100); // Retry after a short delay
      return;
  }
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

// RENDER CART PAGE
function renderCartPage() {
  const itemsDiv = document.getElementById('cart-page-items');

  if (!cartReady) {
    console.log('[renderCartPage] Cart not ready, displaying loading message.');
    if (itemsDiv) itemsDiv.innerHTML = '<div class="cart-empty-message">Loading cart...</div>';
    return;
  }
  console.log('[renderCartPage] Cart is ready, proceeding to render.');
  console.log('[renderCartPage] Starting with key:', currentCartKey);
  const cart = getCart();
  const totalDiv = document.getElementById('cart-page-total');
  const couponSection = document.getElementById('coupon-section');
  const discountRow = document.getElementById('discount-row');
  const finalTotalDiv = document.getElementById('final-total');

  if (!cart.length) {
    console.log('[renderCartPage] Cart is empty');
    if (itemsDiv) itemsDiv.innerHTML = '<div class="cart-empty-message">Your cart is empty.</div>';
    if (totalDiv) totalDiv.textContent = '$0.00';
    if (finalTotalDiv) finalTotalDiv.textContent = '$0.00';
    if (couponSection) couponSection.style.display = 'block';
    if (discountRow) discountRow.style.display = 'none';
    renderPayPalButton(0);
    return;
  }

  console.log('[renderCartPage] Rendering cart with', cart.length, 'items');

  let total = 0;
  let html = '';
  cart.forEach((item, index) => {
    total += item.price * item.qty;
    html += `
      <div class="cart-item-row">
        <span class="cart-item-name">${item.name}</span>
        <div class="cart-item-qty-row">
          <button class="cart-qty-btn" onclick="window.changeCartItemQty(${index}, -1)">-</button>
          <span class="cart-item-qty">${item.qty}</span>
          <button class="cart-qty-btn" onclick="window.changeCartItemQty(${index}, 1)">+</button>
        </div>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        <button class="cart-item-remove" onclick="window.removeCartItem(${index})">✕</button>
      </div>
    `;
  });

  if (itemsDiv) itemsDiv.innerHTML = html;
  if (totalDiv) totalDiv.textContent = `$${total.toFixed(2)}`;
  if (couponSection) couponSection.style.display = 'block';
  let finalTotal = total;
  if (finalTotalDiv) finalTotalDiv.textContent = `$${finalTotal.toFixed(2)}`;

  // If coupon is applied, show discount
  const couponInput = document.getElementById('coupon-input');
  const discountAmount = document.getElementById('discount-amount');
  if (couponInput && couponInput.disabled && couponInput.value.trim() === '15%-key-1371-8512') {
    const discount = total * 0.15;
    finalTotal = total - discount;
    if (discountRow) discountRow.style.display = 'flex';
    if (discountAmount) discountAmount.textContent = `-$${discount.toFixed(2)}`;
    if (finalTotalDiv) finalTotalDiv.textContent = `$${finalTotal.toFixed(2)}`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  // Render PayPal button
  renderPayPalButton(finalTotal);
}

// Add this function to render PayPal buttons
function renderPayPalButton(finalTotal) {
  const paypalContainer = document.getElementById('paypal-button-container');
  if (!paypalContainer) return;
  paypalContainer.innerHTML = '';
  if (window.paypal && finalTotal > 0) {
    window.paypal.Buttons({
      style: { shape: 'pill', color: 'blue', layout: 'horizontal', label: 'paypal' },
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{ amount: { value: finalTotal.toFixed(2) }, description: 'Cartel Cheats Purchase' }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert('Thank you for your purchase, ' + details.payer.name.given_name + '!');
          setCart([]);
        });
      }
    }).render('#paypal-button-container');
  }
}

// Global login functions
window.loginWithGoogle = async function() {
  console.log('[loginWithGoogle] Function called');
  try {
    if (!auth) {
      console.log('[loginWithGoogle] Firebase not initialized, initializing now...');
      await initializeFirebase();
    }
    console.log('[loginWithGoogle] Attempting to sign in with popup...');
    const { signInWithPopup } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('[loginWithGoogle] User signed in:', user);

    // Check if user already has a username
    const savedUsername = localStorage.getItem(`username_${user.uid}`);
    if (savedUsername) {
      console.log('[loginWithGoogle] User has saved username:', savedUsername);
      hideLoginOverlay();
      updateUserGreeting({ ...user, displayName: savedUsername });
    } else {
      console.log('[loginWithGoogle] User has no saved username, showing nickname setup.');
      // Show nickname setup overlay
      document.getElementById('login-overlay').style.display = 'none';
      document.getElementById('nickname-overlay').style.display = 'flex';
    }
  } catch (error) {
    console.error('[loginWithGoogle] Google login error:', error);
    alert('Login failed. Please try again.');
  }
};

window.loginWithKey = function() {
  console.log('[loginWithKey] Function called');
  const keyInput = document.getElementById('key-input');
  if (!keyInput) {
    console.error('[loginWithKey] Key input not found');
    return;
  }

  const key = keyInput.value.trim();
  console.log('[loginWithKey] Key input value:', key);

  if (key === 'ussniper-is-the-goat') {
    console.log('[loginWithKey] Key is correct. Logging in...');
    // Create a mock user object for key login
    const mockUser = {
      uid: 'key_user_' + Date.now(),
      displayName: 'Key User',
      email: 'key@cartelcheats.com',
      isKeyUser: true
    };

    // Store the mock user in localStorage to persist the login
    localStorage.setItem('key_user', JSON.stringify(mockUser));

    // Clear the input field
    keyInput.value = '';

    hideLoginOverlay();
    updateUserGreeting(mockUser);
  } else if (key !== '') {
    console.log('[loginWithKey] Invalid key entered:', key);
    alert('Invalid access key. Please try again.');
    keyInput.value = '';
    keyInput.focus();
  }
};

window.saveUsername = function() {
  const usernameInput = document.getElementById('username-input');
  const usernameMessage = document.getElementById('username-message');
  const username = usernameInput.value.trim();

  if (!username) {
    usernameMessage.textContent = 'Please enter a username';
    usernameMessage.className = 'error';
    return;
  }

  if (username.length < 3) {
    usernameMessage.textContent = 'Username must be at least 3 characters';
    usernameMessage.className = 'error';
    return;
  }

  if (username.length > 20) {
    usernameMessage.textContent = 'Username must be less than 20 characters';
    usernameMessage.className = 'error';
    return;
  }

  // Save username for current user
  if (auth && auth.currentUser) {
    localStorage.setItem(`username_${auth.currentUser.uid}`, username);

    // Hide nickname overlay and show main content
    document.getElementById('nickname-overlay').style.display = 'none';
    updateUserGreeting({ ...auth.currentUser, displayName: username });
  }
};

window.logout = async function() {
  // Clear key user data if it exists
  localStorage.removeItem('key_user');

  // Sign out from Firebase if logged in
  if (auth && auth.currentUser) {
    try {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js");
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  } else {
    // If it was a key user, just update the UI
    showLoginOverlay();
    updateUserGreeting(null);
  }
};

// Make functions globally accessible
window.showLoginOverlay = showLoginOverlay;
window.hideLoginOverlay = hideLoginOverlay;
window.updateUserGreeting = updateUserGreeting;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;
window.getCart = getCart;
window.setCart = setCart;
window.renderCartPage = renderCartPage;
window.saveUsername = window.saveUsername;
window.changeCartItemQty = function(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  setCart(cart);
};
window.removeCartItem = function(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
};


// Add this function for notification
function showAddToCartNotification(productName) {
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

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('[DOMContentLoaded] Starting initialization');

  // Initialize typewriter effect on home page
  console.log('[DOMContentLoaded] Looking for typewriter elements...');
  const header = document.getElementById('typewriter-header');
  const desc = document.getElementById('typewriter-desc');
  console.log('[DOMContentLoaded] Header element:', header);
  console.log('[DOMContentLoaded] Desc element:', desc);
  
  if (header && desc) {
    console.log('[DOMContentLoaded] Found typewriter elements, starting effect in 1 second...');
    
    // Wait a moment to ensure everything is loaded
    setTimeout(() => {
      console.log('[DOMContentLoaded] Starting typewriter effect NOW');
      header.innerHTML = '';
      desc.innerHTML = '';
      
      typeWriter(header, 'Welcome To Cartel Cheats', 100, () => {
        console.log('[DOMContentLoaded] First line complete, starting second line...');
        setTimeout(() => {
          typeWriter(desc, 'Buy Undetected Cheats Here! Browse Our Top Quality Cheats Below!', 60);
        }, 800);
      });
    }, 1000);
  } else {
    console.log('[DOMContentLoaded] ERROR: Typewriter elements not found!', { header, desc });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // DELETE THIS SECTION (Add to cart logic for .add-cart-btn)
  document.querySelectorAll('.add-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!cartReady) {
        showAddToCartNotification('Cart not ready yet!');
        return;
      }
      let name = this.getAttribute('data-name') || this.closest('.product-card')?.querySelector('h3')?.textContent?.trim() || 'Product';
      let price = parseFloat(this.getAttribute('data-price') || this.closest('.product-card')?.querySelector('.buy-price')?.textContent?.replace(/[^\d.]/g, '') || '0');
      let qty = 1;
      console.log('[add-cart-btn] Clicked:', name, price, qty);
      addToCart(name, price, qty);
    });
  });

  // Delete all cart items button
  const deleteAllCartBtn = document.getElementById('delete-all-cart-btn');
  if (deleteAllCartBtn) {
    deleteAllCartBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to delete all items from your cart?')) {
        setCart([]);
        showAddToCartNotification('All cart items deleted!');
      }
    });
  }

  // Quantity selector logic
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('quantity');
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.onclick = () => { let v = Math.max(1, parseInt(qtyInput.value) - 1); qtyInput.value = v; };
    qtyPlus.onclick = () => { let v = Math.max(1, parseInt(qtyInput.value) + 1); qtyInput.value = v; };
  }

  // Add event listeners for login buttons
  const loginGoogleBtn = document.getElementById('login-btn');
  if (loginGoogleBtn) {
    loginGoogleBtn.addEventListener('click', window.loginWithGoogle);
  }

  const loginKeyBtn = document.getElementById('login-key-btn');
  if (loginKeyBtn) {
    loginKeyBtn.addEventListener('click', window.loginWithKey);
  }

  // Add Enter key support for key input
  const keyInput = document.getElementById('key-input');
  if (keyInput) {
    keyInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.loginWithKey();
      }
    });
  }

  // Add Enter key support for username input
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) {
    usernameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        window.saveUsername();
      }
    });
  }

  // Initialize Firebase
  initializeFirebase().then(() => {
    console.log('[DOMContentLoaded] Firebase initialized');
    // No setTimeout here, onAuthStateChanged will handle updateCartUI
  });

  // On cart page, show loading message until cartReady
  if (window.location.href.includes('cart.html')) {
    const itemsDiv = document.getElementById('cart-page-items');
    if (itemsDiv) itemsDiv.innerHTML = '<div class="cart-empty-message">Loading cart...</div>';
    console.log('[DOMContentLoaded] Cart page: Initial loading message set.');
  }
});