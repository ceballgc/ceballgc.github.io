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

const G_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwtyOdMjYx8XanduTMejYcij_SqbGPciIX-pHE01Ow3Oxj2Cl8kHm4lzUZC0HMX-TOc/exec';

// --- MENU DATA ---
const MENU_ITEMS = [
    { id: 1, name: 'Sourdough', price: 12.00, img: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?w=200' },
    { id: 2, name: 'Croissant', price: 4.50, img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200' },
    { id: 3, name: 'Bagel', price: 3.00, img: 'https://images.unsplash.com/photo-1533512930330-4ac257c86793?w=200' },
    { id: 4, name: 'Coffee', price: 3.50, img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200' }
];

// --- APP STATE ---
let cart = [];
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- AUTH LOGIC ---
onAuthStateChanged(auth, (user) => {
    const loginSection = document.getElementById('loginSection');
    const orderSection = document.getElementById('orderSection');
    if (user) {
        loginSection.classList.add('hidden');
        orderSection.classList.remove('hidden');
        document.getElementById('userBadge').innerText = user.email;
        renderMenu();
    } else {
        loginSection.classList.remove('hidden');
        orderSection.classList.add('hidden');
    }
});

document.getElementById('loginBtn').onclick = () => {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// --- POS LOGIC ---
function renderMenu() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = MENU_ITEMS.map(item => `
        <div class="item-card" onclick="addToCart('${item.name}', ${item.price})">
            <img src="${item.img}">
            <div class="item-info">
                <strong>${item.name}</strong>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

window.addToCart = (name, price) => {
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; } 
    else { cart.push({ name, price, qty: 1 }); }
    renderCart();
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
};

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('totalPrice');
    container.innerHTML = cart.length === 0 ? '<p>Cart is empty</p>' : '';
    
    let total = 0;
    cart.forEach((item, index) => {
        total += (item.price * item.qty);
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.qty}x ${item.name}</span>
            <button onclick="removeFromCart(${index})" style="width:auto; padding:4px 8px; background:#fee2e2; color:red;">X</button>
        `;
        container.appendChild(div);
    });
    totalEl.innerText = `$${total.toFixed(2)}`;
}

document.getElementById('checkoutBtn').onclick = async () => {
    if (cart.length === 0) return;
    
    const btn = document.getElementById('checkoutBtn');
    btn.disabled = true;
    btn.innerText = "Sending...";

    const orderSummary = cart.map(i => `${i.qty}x ${i.name}`).join(", ");
    
    const data = {
        item: orderSummary,
        quantity: cart.reduce((sum, i) => sum + i.qty, 0),
        notes: `Total: ${document.getElementById('totalPrice').innerText}`,
        user: auth.currentUser.email
    };

    try {
        await fetch(G_SHEETS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        alert("Order Sent to Kitchen!");
        cart = [];
        renderCart();
    } catch (err) {
        alert("Error sending order.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Send to Kitchen";
    }
};
