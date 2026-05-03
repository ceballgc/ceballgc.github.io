import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDGrJNt2dPdVpElv_XHM3QT0wK_p3HT-TQ",
    authDomain: "sweetcrumbs-1d258.firebaseapp.com",
    projectId: "sweetcrumbs-1d258",
    storageBucket: "sweetcrumbs-1d258.firebasestorage.app",
    messagingSenderId: "949428530628",
    appId: "1:949428530628:web:0db79ac88d09a1c6e38891",
    measurementId: "G-MB1ZH59DSZ"
};

const G_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwD2m_6r2xe3CWMZ4kdg3cEjukqTDmtuQbr7L2_IYpPyNA4RpWrD4GvS9r0NvHiZxiCiw/exec';

let cart = [];
const auth = getAuth(initializeApp(firebaseConfig));

// --- INITIALIZATION ---
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('loginSection');
    const orderSection = document.getElementById('orderSection');
    const kitchenSection = document.getElementById('kitchenOrders');

    if (loginSection) loginSection.classList.toggle('hidden', !!user);
    if (orderSection) orderSection.classList.toggle('hidden', !user);

    if (user) {
        const badge = document.getElementById('userBadge');
        if (badge) badge.innerText = user.email;

        if (document.getElementById('menuGrid')) loadMenu();
        if (kitchenSection) {
            fetchOrders();
            setInterval(fetchOrders, 20000); // Poll every 20s
        }
    }
});

// --- AUTH ---
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.onclick = () => {
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
    };
}
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.onclick = () => signOut(auth);

// --- FOH LOGIC ---
async function loadMenu() {
    try {
        const response = await fetch(`${G_SHEETS_URL}?action=getMenu`);
        const items = await response.json();
        renderMenu(items);
    } catch (err) { console.error("Menu error:", err); }
}

function renderMenu(items) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = items.map(item => `
        <div class="item-card" onclick="addToCart('${item.name}', ${item.price})">
            <img src="${item.img || 'https://via.placeholder.com/200'}">
            <div class="item-info"><strong>${item.name}</strong><br>$${parseFloat(item.price).toFixed(2)}</div>
        </div>
    `).join('');
}

window.addToCart = (name, price) => {
    const item = cart.find(i => i.name === name);
    if (item) item.qty++; else cart.push({ name, price, qty: 1 });
    renderCart();
};

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    container.innerHTML = cart.length ? '' : '<p>Cart is empty</p>';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        container.innerHTML += `
            <div class="cart-item">
                <span>${item.qty}x ${item.name}</span>
                <button onclick="removeFromCart(${idx})" style="color:var(--danger); background:none;">✕</button>
            </div>`;
    });
    document.getElementById('totalPrice').innerText = `$${total.toFixed(2)}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); renderCart(); };

const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    checkoutBtn.onclick = async () => {
        if (!cart.length) return;
        checkoutBtn.disabled = true;
        checkoutBtn.innerText = "Sending...";
        const orderID = "ORD-" + Date.now().toString().slice(-6);
        try {
            const promises = cart.map(item => {
                const data = { orderID, item: item.name, quantity: item.qty, user: auth.currentUser.email };
                return fetch(G_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
            });
            await Promise.all(promises);
            alert(`Order #${orderID} sent!`);
            cart = []; renderCart();
        } catch (err) { alert("Error sending order"); }
        finally { checkoutBtn.disabled = false; checkoutBtn.innerText = "Send to Kitchen"; }
    };
}

// --- BOH LOGIC ---
async function fetchOrders() {
    const container = document.getElementById('kitchenOrders');
    if (!container) return;
    try {
        const resp = await fetch(`${G_SHEETS_URL}?action=getOrders`);
        const rows = await resp.json();
        if (rows.length === 0) {
            container.innerHTML = '<div style="text-align:center; margin-top:50px;">No active orders</div>';
            return;
        }
        const grouped = rows.reduce((acc, curr) => {
            if (!acc[curr.orderID]) {
                acc[curr.orderID] = { id: curr.orderID, status: curr.status, time: curr.createdAt, items: [] };
            }
            acc[curr.orderID].items.push({ name: curr.item, qty: curr.quantity });
            return acc;
        }, {});

        container.innerHTML = Object.values(grouped).map(o => `
            <div class="order-card ${o.status.toLowerCase()}" id="card-${o.id}" onclick="openOrderModal('${o.id}', '${o.status}', '${o.time}')">
                <div style="display:flex; justify-content:space-between;">
                    <h3 style="margin:0;">#${o.id}</h3>
                    <span class="status-tag">${o.status}</span>
                </div>
                <div class="order-details">
                    ${o.items.map(i => `<div>${i.qty}x ${i.name}</div>`).join('')}
                </div>
                <small style="color:#64748b;">${new Date(o.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
            </div>
        `).join('');
    } catch (err) { console.error("Fetch error:", err); }
}

window.openOrderModal = (id, status, time) => {
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    content.innerHTML = `
        <h3>Order #${id}</h3>
        <p style="font-size:14px; color:#64748b;">Placed at: ${new Date(time).toLocaleTimeString()}</p>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
            <button onclick="processUpdate('${id}', 'Preparing')" style="background:var(--warning); color:white; padding:15px;">START PREPARING</button>
            <button onclick="processUpdate('${id}', 'Completed')" style="background:var(--success); color:white; padding:15px;">MARK COMPLETED</button>
            <button onclick="closeModal()" style="background:#e2e8f0; color:#475569; padding:10px;">Cancel</button>
        </div>
    `;
};

window.closeModal = () => document.getElementById('orderModal').classList.add('hidden');

window.processUpdate = (id, nextStatus) => {
    const card = document.getElementById(`card-${id}`);
    if (nextStatus === 'Completed' && card) card.style.display = 'none';
    else if (card) {
        card.className = `order-card ${nextStatus.toLowerCase()}`;
        card.querySelector('.status-tag').innerText = nextStatus;
    }
    closeModal();
    fetch(G_SHEETS_URL, {
        method: 'POST', mode: 'no-cors',
        body: JSON.stringify({ orderID: id, status: nextStatus, action: 'update' })
    }).catch(() => fetchOrders());
};
