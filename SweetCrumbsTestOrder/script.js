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

const G_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwZpL5j5PcPs2e4Lp1dutxJqm53Bv_Qw4Unps_5U6DqvzX_WzYY7PsYrTqixtDxiGYp/exec';

const MENU_ITEMS = [
    { name: 'Sourdough', price: 12.00, img: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?w=200' },
    { name: 'Croissant', price: 4.50, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200' },
    { name: 'Bagel', price: 3.00, img: 'https://images.unsplash.com/photo-1533512930330-4ac257c86793?w=200' }
];

let cart = [];
const auth = getAuth(initializeApp(firebaseConfig));

onAuthStateChanged(auth, (user) => {
    document.getElementById('loginSection').classList.toggle('hidden', !!user);
    document.getElementById('orderSection').classList.toggle('hidden', !user);
    if (user) {
        document.getElementById('userBadge').innerText = user.email;
        renderMenu();
    }
});

document.getElementById('loginBtn').onclick = () => {
    signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPassword').value)
        .catch(err => alert(err.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

function renderMenu() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = MENU_ITEMS.map(item => `
        <div class="item-card" onclick="addToCart('${item.name}', ${item.price})">
            <img src="${item.img}">
            <div class="item-info"><strong>${item.name}</strong><br>$${item.price.toFixed(2)}</div>
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
    container.innerHTML = cart.length ? '' : '<p>Cart is empty</p>';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.price * item.qty;
        container.innerHTML += `<div class="cart-item"><span>${item.qty}x ${item.name}</span><button onclick="removeFromCart(${idx})" style="color:red; background:none;">X</button></div>`;
    });
    document.getElementById('totalPrice').innerText = `$${total.toFixed(2)}`;
}

window.removeFromCart = (i) => { cart.splice(i, 1); renderCart(); };

document.getElementById('checkoutBtn').onclick = async () => {
    if (!cart.length) return;
    const btn = document.getElementById('checkoutBtn');
    btn.disabled = true;
    btn.innerText = "Sending...";

    // GENERATE A UNIQUE ORDER ID (Timestamp + Random)
    const orderID = "ORD-" + Date.now().toString().slice(-6);

    try {
        // Send each item as a separate row
        const promises = cart.map(item => {
            const data = {
                orderID: orderID,
                item: item.name,
                quantity: item.qty,
                user: auth.currentUser.email
            };
            return fetch(G_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        });

        await Promise.all(promises);
        alert("Order #" + orderID + " sent!");
        cart = []; renderCart();
    } catch (err) {
        alert("Error sending order");
    } finally {
        btn.disabled = false;
        btn.innerText = "Send to Kitchen";
    }
};
