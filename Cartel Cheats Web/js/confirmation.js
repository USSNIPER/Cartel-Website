// Order confirmation functionality with Discord integration

// Your Discord webhook URL (replace with your actual webhook)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN';

// Initialize Discord notifier
// In confirmation.js, you'll need to add:
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1401716315957366907/rqVLxoKjra2AjbKPD4qmicRLBvwNfiFqrfMV3m6n5cw_qPLAqD4e6zJTdYnLQ4d3cLUH'; // Replace with your actual webhook URL
const notifier = new DiscordOrderNotifier(https://discord.com/api/webhooks/1401716315957366907/rqVLxoKjra2AjbKPD4qmicRLBvwNfiFqrfMV3m6n5cw_qPLAqD4e6zJTdYnLQ4d3cLUH);

// Generate unique order number
function generateOrderNumber() {
    const usedNumbers = JSON.parse(localStorage.getItem('usedOrderNumbers') || '[]');
    let orderNumber;
    
    do {
        // Generate two random 4-digit numbers
        const firstNumber = Math.floor(1000 + Math.random() * 9000);
        const secondNumber = Math.floor(1000 + Math.random() * 9000);
        orderNumber = `cartel-order-${firstNumber}-${secondNumber}`;
    } while (usedNumbers.includes(orderNumber));
    
    // Store the used number
    usedNumbers.push(orderNumber);
    localStorage.setItem('usedOrderNumbers', JSON.stringify(usedNumbers));
    
    return orderNumber;
}

// Save order to history
function saveOrderToHistory(orderData) {
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.push({
        ...orderData,
        timestamp: new Date().toISOString(),
        status: 'pending'
    });
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
}

// Copy order number to clipboard
function copyOrderNumber() {
    const orderNumber = document.getElementById('order-number').textContent;
    navigator.clipboard.writeText(orderNumber).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#00ff88';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = orderNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Load order details from URL parameters or localStorage
function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderData = urlParams.get('orderData');
    
    if (orderData) {
        try {
            const order = JSON.parse(decodeURIComponent(orderData));
            displayOrderDetails(order);
        } catch (e) {
            console.error('Error parsing order data:', e);
            // Fallback to localStorage
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const order = {
        items: cartItems,
        total: total
    };
    
    displayOrderDetails(order);
}

async function displayOrderDetails(order) {
    // Generate and display order number
    const orderNumber = generateOrderNumber();
    document.getElementById('order-number').textContent = orderNumber;
    
    // Create complete order data
    const completeOrderData = {
        orderNumber: orderNumber,
        items: order.items,
        total: order.total,
        timestamp: new Date().toISOString()
    };
    
    // Save to order history
    saveOrderToHistory(completeOrderData);
    
    // Send Discord notification
    try {
        await discordNotifier.sendOrderNotification(completeOrderData);
        console.log('Discord notification sent successfully');
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        // Continue with order processing even if Discord fails
    }
    
    // Display order items
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-quantity">x${item.quantity}</span>
                </div>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItemsContainer.appendChild(itemElement);
        });
    }
    
    // Display total
    document.getElementById('total-amount').textContent = order.total.toFixed(2);
    
    // Clear cart after successful order
    localStorage.removeItem('cartItems');
    
    // Update cart count in other pages
    if (window.updateCartCount) {
        window.updateCartCount();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadOrderDetails);