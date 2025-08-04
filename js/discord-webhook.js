// Discord webhook integration for order notifications

class DiscordOrderNotifier {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl; // Your Discord webhook URL
    }

    async sendOrderNotification(orderData) {
        const embed = {
            title: "🛒 New Order Received!",
            color: 0x00FFD0, // Cartel Cheats brand color
            fields: [
                {
                    name: "Order Number",
                    value: `\`${orderData.orderNumber}\``,
                    inline: true
                },
                {
                    name: "Total Amount",
                    value: `$${orderData.total.toFixed(2)}`,
                    inline: true
                },
                {
                    name: "Timestamp",
                    value: new Date().toLocaleString(),
                    inline: true
                },
                {
                    name: "Items Purchased",
                    value: orderData.items.map(item => 
                        `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
                    ).join('\n'),
                    inline: false
                }
            ],
            footer: {
                text: "Cartel Cheats Order System",
                icon_url: "https://your-domain.com/logo.png" // Replace with your actual logo URL
            },
            timestamp: new Date().toISOString()
        };

        const payload = {
            embeds: [embed],
            content: "@here New order received! 📦"
        };

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Discord webhook failed: ${response.status}`);
            }

            console.log('Order notification sent to Discord successfully');
            return true;
        } catch (error) {
            console.error('Failed to send Discord notification:', error);
            return false;
        }
    }

    // Method to verify order exists (for Discord bot commands)
    static verifyOrderNumber(orderNumber) {
        const usedNumbers = JSON.parse(localStorage.getItem('usedOrderNumbers') || '[]');
        return usedNumbers.includes(orderNumber);
    }

    // Method to get order details (for Discord bot commands)
    static getOrderDetails(orderNumber) {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        return orderHistory.find(order => order.orderNumber === orderNumber);
    }
}

// Export for use in other files
window.DiscordOrderNotifier = DiscordOrderNotifier;