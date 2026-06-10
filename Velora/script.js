// =============================================
//   VELORA — Luxury Fashion Website
//   JavaScript Logic
// =============================================

// ---- PRODUCT DATA ----
const products = [
  {
    id: 1,
    name: 'The Obsidian Coat',
    category: 'outerwear',
    material: 'Double-faced cashmere',
    price: 4800,
    img: 'images/The Obsidian Coat.jpg',
    badge: 'New'
  },
  {
    id: 2,
    name: 'Onyx Trench',
    category: 'outerwear',
    material: 'Italian gabardine',
    price: 3200,
    img: 'images/Onyx Trench.jpg',
    badge: null
  },
  {
    id: 3,
    name: 'Shadow Cocoon Jacket',
    category: 'outerwear',
    material: 'Boiled wool',
    price: 2600,
    img: 'images/Shadow Cocoon Jacket.jpg',
    badge: null
  },
  {
    id: 4,
    name: 'Velvet Nocturne Gown',
    category: 'eveningwear',
    material: 'Silk velvet',
    price: 6200,
    img: 'images/Velvet Nocturne Gown.jpg',
    badge: 'New'
  },
  {
    id: 5,
    name: 'Midnight Column Dress',
    category: 'eveningwear',
    material: 'Duchess satin',
    price: 4400,
    img: 'images/Midnight Column Dress.jpg',
    badge: null
  },
  {
    id: 6,
    name: 'Sheer Veil Gown',
    category: 'eveningwear',
    material: 'Silk georgette',
    price: 5100,
    img: 'images/Sheer Veil Gown.jpg',
    badge: null
  },
  {
    id: 7,
    name: 'Charcoal Edge Suit',
    category: 'tailoring',
    material: 'Super 130s wool',
    price: 3800,
    img: 'images/Charcoal Edge Suit.jpg',
    badge: 'Best Seller'
  },
  {
    id: 8,
    name: 'Shadow Peak Blazer',
    category: 'tailoring',
    material: 'Chalk-stripe flannel',
    price: 2900,
    img: 'images/Shadow Peak Blazer.jpg',
    badge: null
  },
  {
    id: 9,
    name: 'Phantom Tuxedo',
    category: 'tailoring',
    material: 'Silk-lapel wool',
    price: 4200,
    img: 'images/Phantom Tuxedo.jpg',
    badge: null
  },
  {
    id: 10,
    name: 'Umbra Silk Scarf',
    category: 'accessories',
    material: 'Pure silk twill',
    price: 580,
    img: 'images/Umbra Silk Scarf.jpg',
    badge: null
  },
  {
    id: 11,
    name: 'Noir Leather Bag',
    category: 'accessories',
    material: 'Full-grain calf leather',
    price: 1850,
    img: 'images/Velora Leather Bag.jpg',
    badge: null
  },
  {
    id: 12,
    name: 'The Void Sunglasses',
    category: 'accessories',
    material: 'Acetate & titanium',
    price: 620,
    img: 'images/The Void Sunglasses.jpg',
    badge: null
  }
];

// ---- CART STATE ----
let cart = [];
let currentFilter = 'all';

// ---- PAGE NAVIGATION ----
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = 'none';
  });

  const target = document.getElementById(pageId);
  if (!target) return;

  target.style.display = 'block';
  // Small delay to trigger CSS transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add('active');
    });
  });

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- RENDER SHOP ----
function renderShop(filter = 'all') {
  const grid = document.getElementById('shopGrid');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  grid.innerHTML = '';

  filtered.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.06}s`;

    card.innerHTML = `
      <div class="product-img">
  <img src="${product.img}" alt="${product.name}" class="product-image">
  <div class="product-overlay"></div>
</div>
      <div class="product-info">
        <p class="product-cat">${product.category}</p>
        <p class="product-name">${product.name}</p>
        <p class="product-material">${product.material}</p>
        <div class="product-footer">
          <span class="product-price">€${product.price.toLocaleString()}</span>
          <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ---- FILTER BUTTONS ----
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

// ---- CART ----
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  updateCart();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = `€${total.toLocaleString()}`;

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
          <p class="cart-item-price">€${item.price.toLocaleString()} ${item.qty > 1 ? `× ${item.qty}` : ''}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
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

// ---- TOAST ----
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- CONTACT FORM ----
function handleFormSubmit(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  e.target.querySelector('.btn-primary').textContent = 'Message Sent';
  e.target.querySelector('.btn-primary').disabled = true;
  e.target.querySelector('.btn-primary').style.opacity = '0.6';
}

// ---- NAV LINKS ----
function initNavLinks() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });
}

// ---- NAVBAR SCROLL EFFECT ----
function initNavScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.borderBottomColor = 'rgba(200,169,110,0.15)';
    } else {
      navbar.style.borderBottomColor = 'var(--border)';
    }
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Show home by default
  showPage('home');

  // Set up shop
  renderShop();
  initFilters();

  // Nav
  initNavLinks();
  initNavScroll();

  // Cart button
  document.getElementById('cartBtn').addEventListener('click', openCart);
});