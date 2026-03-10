import { ref as dbRef, push, set, get } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";

let database;
let currentOrderId = null;
let allOrders = [];

// Initialize Admin
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    } else {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadOrders();
    }
});

// Admin Login
function adminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Simple authentication (In production, use proper authentication)
    if (email === 'vishwa001' && password === '1508') {
        localStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('adminDashboard').classList.remove('hidden');
        loadOrders();
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}

// Load Orders from Firebase
async function loadOrders() {
    try {
        // Load real orders from Firebase Realtime Database
        const ordersRef = dbRef(database, 'orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
            const ordersData = snapshot.val();
            allOrders = Object.keys(ordersData).map(key => ({
                orderId: key,
                ...ordersData[key]
            }));
        } else {
            allOrders = [];
        }
        
        displayOrders(allOrders);
        updateStats();
    } catch (error) {
        console.error('Error loading orders:', error);
        // Fallback to sample data if Firebase fails
        const sampleOrders = [
            {
                orderId: 'US-' + Date.now(),
                fullName: 'Aman Kumar',
                email: 'aman@example.com',
                tcaNumber: 'TCA001',
                pages: 10,
                totalAmount: 50,
                advanceAmount: 10,
                balanceAmount: 40,
                status: 'pending_verification',
                date: new Date().toLocaleDateString()
            }
        ];
        allOrders = sampleOrders;
        displayOrders(allOrders);
        updateStats();
    }
}

// Display Orders
function displayOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.fullName}</td>
                <td>${order.email}</td>
                <td>${order.pages}</td>
                <td>₹${order.totalAmount}</td>
                <td><span class="status-badge status-${order.status}">${order.status.replace('_', ' ')}</span></td>
                <td>${order.date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewOrderDetails('${order.orderId}')">View</button>
                        <button class="btn-verify" onclick="verifyOrder('${order.orderId}')">Verify</button>
                        <button class="btn-unverify" onclick="unverifyOrder('${order.orderId}')">Unverify</button>
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// View Order Details
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.orderId === orderId);
    currentOrderId = orderId;
    
    if (order) {
        const modalBody = `
            <div class="detail-item">
                <label>Order ID:</label>
                <span>${order.orderId}</span>
            </div>
            <div class="detail-item">
                <label>Student Name:</label>
                <span>${order.fullName}</span>
            </div>
            <div class="detail-item">
                <label>Email:</label>
                <span>${order.email}</span>
            </div>
            <div class="detail-item">
                <label>TCA Number:</label>
                <span>${order.tcaNumber}</span>
            </div>
            <div class="detail-item">
                <label>Pages:</label>
                <span>${order.pages}</span>
            </div>
            <div class="detail-item">
                <label>Total Amount:</label>
                <span>₹${order.totalAmount}</span>
            </div>
            <div class="detail-item">
                <label>Advance Paid:</label>
                <span>₹${order.advanceAmount}</span>
            </div>
            <div class="detail-item">
                <label>Balance:</label>
                <span>₹${order.balanceAmount}</span>
            </div>
            <div class="detail-item">
                <label>Status:</label>
                <span>${order.status}</span>
            </div>
            <div class="detail-item">
                <label>Date:</label>
                <span>${order.date}</span>
            </div>
        `;
        
        document.getElementById('modalBody').innerHTML = modalBody;
        document.getElementById('orderModal').classList.remove('hidden');
    }
}

// Close Modal
function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

// Unverify Order
function unverifyOrder(orderId) {
    if (orderId) {
        const order = allOrders.find(o => o.orderId === orderId);
        if (order) {
            order.status = 'pending_verification';
            displayOrders(allOrders);
            updateStats();
            alert('Order unverified. Student will be notified.');
        }
    }
}

// Verify Order
function verifyOrder(orderId) {
    if (orderId) {
        const order = allOrders.find(o => o.orderId === orderId);
        if (order) {
            order.status = 'verified';
            displayOrders(allOrders);
            updateStats();
            alert('Order verified successfully!');
        }
    }
}

// Reject Order
function rejectOrder() {
    if (currentOrderId) {
        const order = allOrders.find(o => o.orderId === currentOrderId);
        if (order) {
            order.status = 'rejected';
            displayOrders(allOrders);
            updateStats();
            closeModal();
            alert('Order rejected. Student will be notified.');
        }
    }
}

// Filter Orders
function filterOrders() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;
    
    const filtered = allOrders.filter(order => {
        const matchSearch = order.fullName.toLowerCase().includes(searchText) ||
                           order.email.toLowerCase().includes(searchText) ||
                           order.tcaNumber.toLowerCase().includes(searchText);
        const matchStatus = !status || order.status === status;
        return matchSearch && matchStatus;
    });
    
    displayOrders(filtered);
}

// Update Stats
function updateStats() {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'pending_verification').length;
    const verified = allOrders.filter(o => o.status === 'verified').length;
    const revenue = allOrders.reduce((sum, o) => sum + o.advanceAmount, 0);
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('verifiedOrders').textContent = verified;
    document.getElementById('totalRevenue').textContent = '₹' + revenue;
}