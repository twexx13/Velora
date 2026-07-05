const API_URL = 'http://localhost:5000/api/v1';

let cart = [];
let currentFilter = 'all';
let allProducts = [];

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const target = document.getElementById(pageId);
  if (!target) return;

  target.style.display = 'block';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('active');
    });
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function fetchProducts() {
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '<p style="text-align:center;color:#9a9690;padding:60px;">Loading collection...</p>';

  try {
    const res = await fetch(`${API_URL}/products?limit=50`);
    const data = await res.json();

    if (data.success) {
      allProducts = data.products;
      renderShop(currentFilter);
    } else {
      grid.innerHTML = '<p style="text-align:center;color:#9a9690;padding:60px;">Could not load products.</p>';
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:#9a9690;padding:60px;">Could not reach server.</p>';
  }
}

function renderShop(filter = 'all') {
  const grid = document.getElementById('shopGrid');

  const filtered = filter === 'all'
    ? allProducts
    : allProducts.filter(p => p.category?.name?.toLowerCase() === filter);

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#9a9690;padding:60px;grid-column:1/-1;">No products found.</p>';
    return;
  }

  filtered.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.06}s`;

    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;

    card.innerHTML = `
      <div class="product-img">
        <img src="${imageUrl}" alt="${product.name}" class="product-image"
          onerror="this.src='https://via.placeholder.com/400x500?text=${encodeURIComponent(product.name)}'">
        <div class="product-overlay"></div>
      </div>
      <div class="product-info">
        <p class="product-cat">${product.category?.name || ''}</p>
        <p class="product-name">${product.name}</p>
        <div class="product-footer">
          <span class="product-price">₹${price.toLocaleString()}</span>
          <button class="add-to-cart" onclick="addToCart('${product._id}', '${product.name}', ${price}, '${imageUrl}')">Add to Cart</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderShop(currentFilter);
    });
  });
}

function addToCart(productId, name, price, image) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name, price, img: image, qty: 1 });
  }
  updateCart();
  showToast(`${name} added to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;

  const cartItems = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartFooter.style.display = 'none';
  } else {
    cartFooter.style.display = 'block';
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-thumb" style="background-image:url('${item.img}'); background-size:cover; background-position:center top;"></div>
        <div>
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">₹${item.price.toLocaleString()} ${item.qty > 1 ? `× ${item.qty}` : ''}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `).join('');
  }
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.btn-primary');
    const success = document.getElementById('formSuccess');

    const payload = {
      name: document.getElementById('contactName').value,
      email: document.getElementById('contactEmail').value,
      subject: document.getElementById('contactSubject').value,
      message: document.getElementById('contactMessage').value
    };

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        success.style.display = 'block';
        submitBtn.textContent = 'Message Sent';
        form.reset();
      } else {
        showToast(data.message || 'Something went wrong');
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
      }
    } catch (err) {
      showToast('Could not reach server. Try again.');
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });
}

function initSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('signupError');
    errorEl.textContent = '';

    const payload = {
      name: document.getElementById('signupName').value,
      email: document.getElementById('signupEmail').value,
      password: document.getElementById('signupPassword').value
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('velora_token', data.token);
        localStorage.setItem('velora_user', JSON.stringify(data.user));
        updateAccountUI();
        showToast(`Welcome to Velora, ${data.user.name}!`);
        form.reset();
        showPage('account');
      } else {
        errorEl.textContent = data.message || 'Signup failed';
      }
    } catch (err) {
      errorEl.textContent = 'Could not reach server. Is the backend running?';
    }
  });
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    const payload = {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    };

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('velora_token', data.token);
        localStorage.setItem('velora_user', JSON.stringify(data.user));
        updateAccountUI();
        showToast(`Welcome back, ${data.user.name}!`);
        form.reset();
        showPage('account');
      } else {
        errorEl.textContent = data.message || 'Login failed';
      }
    } catch (err) {
      errorEl.textContent = 'Could not reach server. Is the backend running?';
    }
  });
}

function initLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    localStorage.removeItem('velora_token');
    localStorage.removeItem('velora_user');
    updateAccountUI();
    showToast('You have been logged out');
    showPage('home');
  });
}

function updateAccountUI() {
  const token = localStorage.getItem('velora_token');
  const user = JSON.parse(localStorage.getItem('velora_user') || 'null');
  const label = document.getElementById('accountLabel');
  const mobileLink = document.getElementById('mobileAccountLink');

  if (token && user) {
    label.textContent = user.name.split(' ')[0];
    document.getElementById('accountName').textContent = user.name;
    document.getElementById('accountEmail').textContent = user.email;
    if (mobileLink) {
      mobileLink.textContent = user.name.split(' ')[0];
      mobileLink.dataset.page = 'account';
    }
  } else {
    label.textContent = 'Login';
    if (mobileLink) {
      mobileLink.textContent = 'Login';
      mobileLink.dataset.page = 'login';
    }
  }
}

function initAccountButton() {
  const btn = document.getElementById('accountBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const token = localStorage.getItem('velora_token');
    showPage(token ? 'account' : 'login');
  });
}

function initNavLinks() {
  document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
      closeMobileMenu();
    });
  });
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const closeBtn = document.getElementById('mobileClose');
  const overlay = document.getElementById('mobileOverlay');
  if (hamburger) hamburger.addEventListener('click', openMobileMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);
}

function openMobileMenu() {
  document.getElementById('mobileMenu').classList.add('open');
  document.getElementById('mobileOverlay').classList.add('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
}

function initNavScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.borderBottomColor = window.scrollY > 40
      ? 'rgba(200,169,110,0.15)'
      : 'var(--border)';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
  fetchProducts();
  initFilters();
  initNavLinks();
  initNavScroll();
  initMobileMenu();
  initContactForm();
  initSignupForm();
  initLoginForm();
  initLogout();
  initAccountButton();
  updateAccountUI();
  document.getElementById('cartBtn').addEventListener('click', openCart);
});
