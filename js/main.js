/* ═══════════════════════════════════════════
   ROZINA SIGNATURE LIVING — Storefront JS
   ═══════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── State ── */
  let allProducts = [];
  let filteredProducts = [];
  let activeCategory = 'all';
  let activeSort = 'newest';
  let cart = loadCart();

  /* ── DOM refs ── */
  const productGrid   = document.getElementById('product-grid');
  const emptyState    = document.getElementById('empty-state');
  const categoryBtns  = document.querySelectorAll('.cat-pill');
  const sortSelect    = document.getElementById('sort-select');
  const searchInput   = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const cartBtn       = document.getElementById('cart-btn');
  const cartCount     = document.getElementById('cart-count');
  const cartOverlay   = document.getElementById('cart-overlay');
  const cartDrawer    = document.getElementById('cart-drawer');
  const cartClose     = document.getElementById('cart-close');
  const cartItems     = document.getElementById('cart-items');
  const cartFooter    = document.getElementById('cart-footer');
  const cartTotal     = document.getElementById('cart-total-price');
  const checkoutBtn   = document.getElementById('checkout-btn');
  const modalOverlay  = document.getElementById('modal-overlay');
  const modalClose    = document.getElementById('modal-close');
  const modalInner    = document.getElementById('modal-inner');
  const toast         = document.getElementById('toast');
  const hamburger     = document.getElementById('hamburger');
  const mainNav       = document.getElementById('main-nav');
  const contactForm   = document.getElementById('contact-form');
  const formSuccess   = document.getElementById('form-success');

  /* ══════════════ INIT ══════════════ */
  function init() {
    allProducts = RozinaDB.getAll();
    applyFilters();
    renderCart();
    bindEvents();
  }

  /* ══════════════ PRODUCTS ══════════════ */
  function applyFilters() {
    let list = [...allProducts];
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    switch (activeSort) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      default:           list.sort((a, b) => b.createdAt - a.createdAt); break;
    }
    filteredProducts = list;
    renderGrid();
  }

  function renderGrid() {
    if (!filteredProducts.length) {
      productGrid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    productGrid.innerHTML = filteredProducts.map(p => productCardHTML(p)).join('');
    /* bind card events */
    productGrid.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;
      card.querySelector('.card-view-btn').addEventListener('click', e => {
        e.stopPropagation();
        openModal(id);
      });
      card.querySelector('.card-cart-btn').addEventListener('click', e => {
        e.stopPropagation();
        addToCart(id);
      });
      card.addEventListener('click', () => openModal(id));
    });
  }

  function productCardHTML(p) {
    const imgSrc = p.image || RozinaDB.placeholderSVG();
    const badges = [];
    if (p.stock === 0) badges.push('<span class="badge badge-out">Out of Stock</span>');
    else if (p.isNew) badges.push('<span class="badge badge-new">New</span>');
    if (p.oldPrice) badges.push('<span class="badge badge-sale">Sale</span>');

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card-img">
          <img src="${imgSrc}" alt="${esc(p.name)}" loading="lazy"
               onerror="this.src='${RozinaDB.placeholderSVG()}'" />
          ${badges.length ? `<div class="product-badges">${badges.join('')}</div>` : ''}
        </div>
        <div class="product-card-body">
          <p class="product-cat">${esc(p.category)}</p>
          <p class="product-name">${esc(p.name)}</p>
          <div class="product-pricing">
            <span class="product-price">${RozinaDB.formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="product-old-price">${RozinaDB.formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <div class="product-card-actions">
            <button class="btn btn-outline card-view-btn" ${p.stock === 0 ? 'disabled' : ''}>View</button>
            <button class="btn btn-primary card-cart-btn" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
          </div>
        </div>
      </div>`;
  }

  /* ══════════════ MODAL ══════════════ */
  function openModal(id) {
    const p = RozinaDB.getById(id);
    if (!p) return;
    const imgSrc = p.image || RozinaDB.placeholderSVG();
    const stockLabel = p.stock === 0
      ? '<span class="modal-stock out">Out of stock</span>'
      : `<span class="modal-stock in">In stock (${p.stock} available)</span>`;

    modalInner.innerHTML = `
      <div class="modal-img">
        <img src="${imgSrc}" alt="${esc(p.name)}"
             onerror="this.src='${RozinaDB.placeholderSVG()}'" />
      </div>
      <div class="modal-details">
        <p class="modal-cat">${esc(p.category)}</p>
        <h2 class="modal-name">${esc(p.name)}</h2>
        <div class="modal-pricing">
          <span class="modal-price">${RozinaDB.formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="modal-old">${RozinaDB.formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <p class="modal-desc">${esc(p.description)}</p>
        ${stockLabel}
        <div class="modal-actions">
          <button class="btn btn-primary" id="modal-cart-btn" ${p.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
          <button class="btn btn-ghost" id="modal-close-btn">Close</button>
        </div>
      </div>`;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('modal-cart-btn').addEventListener('click', () => {
      addToCart(id);
      closeModal();
    });
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ══════════════ CART ══════════════ */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('rozina_cart')) || [];
    } catch { return []; }
  }

  function saveCart() {
    localStorage.setItem('rozina_cart', JSON.stringify(cart));
  }

  function addToCart(id) {
    const p = RozinaDB.getById(id);
    if (!p || p.stock === 0) return;
    const existing = cart.find(i => i.id === id);
    if (existing) {
      if (existing.qty < p.stock) existing.qty++;
      else { showToast('Maximum stock reached'); return; }
    } else {
      cart.push({ id, qty: 1 });
    }
    saveCart();
    renderCart();
    showToast(`${p.name} added to cart`);
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const p = RozinaDB.getById(id);
    const newQty = item.qty + delta;
    if (newQty < 1) { removeFromCart(id); return; }
    if (p && newQty > p.stock) { showToast('Maximum stock reached'); return; }
    item.qty = newQty;
    saveCart();
    renderCart();
  }

  function renderCart() {
    /* update badge */
    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems ? 'flex' : 'none';

    if (!cart.length) {
      cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      cartFooter.style.display = 'none';
      return;
    }

    let total = 0;
    cartItems.innerHTML = cart.map(item => {
      const p = RozinaDB.getById(item.id);
      if (!p) return '';
      const lineTotal = p.price * item.qty;
      total += lineTotal;
      const imgSrc = p.image || RozinaDB.placeholderSVG();
      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-img">
            <img src="${imgSrc}" alt="${esc(p.name)}"
                 onerror="this.src='${RozinaDB.placeholderSVG()}'" />
          </div>
          <div class="cart-item-info">
            <p class="cart-item-name">${esc(p.name)}</p>
            <p class="cart-item-price">${RozinaDB.formatPrice(p.price)}</p>
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="dec" data-id="${p.id}">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${p.id}">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-id="${p.id}" aria-label="Remove">&times;</button>
        </div>`;
    }).join('');

    cartFooter.style.display = 'flex';
    cartTotal.textContent = RozinaDB.formatPrice(total);

    /* bind qty/remove buttons */
    cartItems.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const delta = btn.dataset.action === 'inc' ? 1 : -1;
        changeQty(id, delta);
      });
    });
    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ══════════════ SEARCH ══════════════ */
  let searchTimeout;
  function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const q = query.trim().toLowerCase();
      if (!q) { searchResults.classList.remove('active'); return; }
      const results = allProducts.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      ).slice(0, 6);

      if (!results.length) {
        searchResults.innerHTML = '<p class="search-no-result">No products found.</p>';
      } else {
        searchResults.innerHTML = results.map(p => {
          const imgSrc = p.image || RozinaDB.placeholderSVG();
          return `
            <div class="search-result-item" data-id="${p.id}">
              <img src="${imgSrc}" alt="${esc(p.name)}"
                   onerror="this.src='${RozinaDB.placeholderSVG()}'" />
              <div class="search-result-info">
                <p class="search-result-name">${esc(p.name)}</p>
                <p class="search-result-price">${RozinaDB.formatPrice(p.price)}</p>
              </div>
            </div>`;
        }).join('');
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            openModal(item.dataset.id);
            searchResults.classList.remove('active');
            searchInput.value = '';
          });
        });
      }
      searchResults.classList.add('active');
    }, 250);
  }

  /* ══════════════ TOAST ══════════════ */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ══════════════ EVENTS ══════════════ */
  function bindEvents() {
    /* Category filter */
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        applyFilters();
      });
    });

    /* Sort */
    sortSelect.addEventListener('change', () => {
      activeSort = sortSelect.value;
      applyFilters();
    });

    /* Search */
    searchInput.addEventListener('input', e => handleSearch(e.target.value));
    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrap')) {
        searchResults.classList.remove('active');
      }
    });

    /* Cart */
    cartBtn.addEventListener('click', openCart);
    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', () => {
      showToast('Checkout coming soon — call us on +254 108 907 912');
    });

    /* Modal */
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });

    /* Hamburger */
    hamburger.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });

    /* Contact form */
    if (contactForm) {
      contactForm.addEventListener('submit', e => {
        e.preventDefault();
        formSuccess.style.display = 'block';
        contactForm.reset();
        setTimeout(() => formSuccess.style.display = 'none', 4000);
      });
    }

    /* Listen for product changes from admin tab */
    window.addEventListener('storage', e => {
      if (e.key === 'rozina_products') {
        allProducts = RozinaDB.getAll();
        applyFilters();
      }
    });
  }

  /* ── Utility ── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', init);
})();
