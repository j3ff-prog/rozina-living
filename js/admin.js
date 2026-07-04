/* ═══════════════════════════════════════════
   ROZINA SIGNATURE LIVING — Admin JS
   ═══════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── Auth ── */
  const CREDS = { user: 'admin', pass: 'rozina2025' };
  const AUTH_KEY = 'rozina_auth';

  /* ── State ── */
  let currentView = 'products';
  let editingId   = null;
  let deleteTarget = null;
  let pendingImageB64 = null;
  let adminSearch = '';
  let adminCatFilter = 'all';

  /* ── DOM ── */
  const loginScreen  = document.getElementById('login-screen');
  const dashboard    = document.getElementById('dashboard');
  const loginBtn     = document.getElementById('login-btn');
  const loginUser    = document.getElementById('l-user');
  const loginPass    = document.getElementById('l-pass');
  const loginError   = document.getElementById('login-error');
  const logoutBtn    = document.getElementById('logout-btn');
  const navItems     = document.querySelectorAll('.nav-item');
  const toast        = document.getElementById('admin-toast');

  /* stats */
  const statTotal    = document.getElementById('stat-total');
  const statStock    = document.getElementById('stat-stock');
  const statFeatured = document.getElementById('stat-featured');

  /* table */
  const adminTbody   = document.getElementById('admin-tbody');
  const adminEmpty   = document.getElementById('admin-empty');
  const adminSearchI = document.getElementById('admin-search');
  const adminCatSel  = document.getElementById('admin-cat-filter');

  /* form */
  const productForm  = document.getElementById('product-form');
  const formTitle    = document.getElementById('form-title');
  const editIdField  = document.getElementById('edit-id');
  const cancelEdit   = document.getElementById('cancel-edit');
  const submitBtn    = document.getElementById('submit-btn');
  const resetBtn     = document.getElementById('reset-btn');
  const formError    = document.getElementById('form-error');
  const pName        = document.getElementById('p-name');
  const pCategory    = document.getElementById('p-category');
  const pDesc        = document.getElementById('p-desc');
  const pPrice       = document.getElementById('p-price');
  const pOldPrice    = document.getElementById('p-old-price');
  const pStock       = document.getElementById('p-stock');
  const pFeatured    = document.getElementById('p-featured');
  const pNew         = document.getElementById('p-new');
  const pImageUrl    = document.getElementById('p-image-url');
  const pImageFile   = document.getElementById('p-image-file');
  const fileDrop     = document.getElementById('file-drop');
  const imgPreviewW  = document.getElementById('image-preview-wrap');
  const imgPreview   = document.getElementById('image-preview');
  const removeImgBtn = document.getElementById('remove-img-btn');

  /* delete modal */
  const delOverlay   = document.getElementById('del-overlay');
  const delName      = document.getElementById('del-name');
  const delConfirm   = document.getElementById('del-confirm');
  const delCancel    = document.getElementById('del-cancel');

  /* ══════════════ AUTH ══════════════ */
  function checkAuth() {
    const authed = sessionStorage.getItem(AUTH_KEY) === '1';
    if (authed) showDashboard();
    else showLogin();
  }

  function showLogin() {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    updateStats();
    renderTable();
  }

  loginBtn.addEventListener('click', () => {
    loginError.textContent = '';
    const u = loginUser.value.trim();
    const p = loginPass.value.trim();
    if (u === CREDS.user && p === CREDS.pass) {
      sessionStorage.setItem(AUTH_KEY, '1');
      showDashboard();
    } else {
      loginError.textContent = 'Incorrect username or password.';
      loginPass.value = '';
    }
  });

  [loginUser, loginPass].forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    showLogin();
    loginUser.value = '';
    loginPass.value = '';
  });

  /* ══════════════ NAVIGATION ══════════════ */
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      switchView(btn.dataset.view);
    });
  });

  function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + view).style.display = 'flex';
    if (view === 'products') { updateStats(); renderTable(); }
    if (view === 'add' && !editingId) resetForm();
  }

  /* ══════════════ STATS ══════════════ */
  function updateStats() {
    const all = RozinaDB.getAll();
    statTotal.textContent   = all.length;
    statStock.textContent   = all.filter(p => p.stock > 0).length;
    statFeatured.textContent = all.filter(p => p.featured).length;
  }

  /* ══════════════ TABLE ══════════════ */
  function renderTable() {
    let products = RozinaDB.getAll();

    if (adminCatFilter !== 'all') {
      products = products.filter(p => p.category === adminCatFilter);
    }
    if (adminSearch) {
      const q = adminSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    if (!products.length) {
      adminTbody.innerHTML = '';
      adminEmpty.style.display = 'block';
      return;
    }

    adminEmpty.style.display = 'none';
    adminTbody.innerHTML = products.map(p => {
      const imgSrc = p.image || '';
      const imgCell = imgSrc
        ? `<img src="${imgSrc}" class="table-img" alt="${esc(p.name)}" onerror="this.style.display='none'" />`
        : `<div class="table-img-placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>`;

      const stockBadge = p.stock > 0
        ? `<span class="stock-badge in">${p.stock}</span>`
        : `<span class="stock-badge out">Out</span>`;

      return `
        <tr>
          <td>${imgCell}</td>
          <td><span class="table-name">${esc(p.name)}</span></td>
          <td><span class="table-cat">${esc(p.category)}</span></td>
          <td>${RozinaDB.formatPrice(p.price)}</td>
          <td>${stockBadge}</td>
          <td>${p.featured ? '<span class="featured-check">★</span>' : '<span class="featured-dash">—</span>'}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn edit-btn" data-id="${p.id}">Edit</button>
              <button class="action-btn del del-btn" data-id="${p.id}" data-name="${esc(p.name)}">Delete</button>
            </div>
          </td>
        </tr>`;
    }).join('');

    adminTbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => startEdit(btn.dataset.id));
    });
    adminTbody.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(btn.dataset.id, btn.dataset.name));
    });
  }

  adminSearchI.addEventListener('input', e => {
    adminSearch = e.target.value.trim();
    renderTable();
  });

  adminCatSel.addEventListener('change', e => {
    adminCatFilter = e.target.value;
    renderTable();
  });

  /* ══════════════ PRODUCT FORM ══════════════ */
  function resetForm() {
    editingId = null;
    pendingImageB64 = null;
    productForm.reset();
    editIdField.value = '';
    formTitle.textContent = 'Add Product';
    submitBtn.textContent = 'Add Product';
    cancelEdit.style.display = 'none';
    formError.textContent = '';
    hideImagePreview();
  }

  function startEdit(id) {
    const p = RozinaDB.getById(id);
    if (!p) return;
    editingId = id;
    pendingImageB64 = null;

    /* switch to add view */
    navItems.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="add"]').classList.add('active');
    switchView('add');

    formTitle.textContent = 'Edit Product';
    submitBtn.textContent = 'Save Changes';
    cancelEdit.style.display = 'inline-flex';
    editIdField.value = id;

    pName.value      = p.name;
    pCategory.value  = p.category;
    pDesc.value      = p.description;
    pPrice.value     = p.price;
    pOldPrice.value  = p.oldPrice || '';
    pStock.value     = p.stock;
    pFeatured.checked = p.featured;
    pNew.checked     = p.isNew;
    pImageUrl.value  = p.image && !p.image.startsWith('data:') ? p.image : '';

    if (p.image) {
      imgPreview.src = p.image;
      imgPreviewW.style.display = 'flex';
      if (p.image.startsWith('data:')) pendingImageB64 = p.image;
    } else {
      hideImagePreview();
    }
    formError.textContent = '';

    /* scroll to top */
    document.querySelector('.admin-main').scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit.addEventListener('click', () => {
    resetForm();
    navItems.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="products"]').classList.add('active');
    switchView('products');
  });

  resetBtn.addEventListener('click', resetForm);

  productForm.addEventListener('submit', e => {
    e.preventDefault();
    formError.textContent = '';

    const name = pName.value.trim();
    const category = pCategory.value;
    const desc = pDesc.value.trim();
    const price = pPrice.value;
    const stock = pStock.value;

    if (!name || !category || !desc || !price || !stock) {
      formError.textContent = 'Please fill in all required fields.';
      return;
    }

    /* resolve image: base64 upload beats URL field */
    const imageVal = pendingImageB64 || pImageUrl.value.trim() || '';

    const data = {
      name, category, description: desc,
      price, oldPrice: pOldPrice.value || null, stock,
      featured: pFeatured.checked, isNew: pNew.checked,
      image: imageVal,
    };

    if (editingId) {
      RozinaDB.update(editingId, data);
      showToast('Product updated successfully');
    } else {
      RozinaDB.add(data);
      showToast('Product added successfully');
    }

    resetForm();
    updateStats();
    navItems.forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="products"]').classList.add('active');
    switchView('products');
  });

  /* ── Image handling ── */
  pImageFile.addEventListener('change', e => handleImageFile(e.target.files[0]));

  fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.style.borderColor = 'var(--gold)'; });
  fileDrop.addEventListener('dragleave', () => { fileDrop.style.borderColor = ''; });
  fileDrop.addEventListener('drop', e => {
    e.preventDefault();
    fileDrop.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  });

  function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingImageB64 = ev.target.result;
      imgPreview.src = pendingImageB64;
      imgPreviewW.style.display = 'flex';
      pImageUrl.value = '';
    };
    reader.readAsDataURL(file);
  }

  pImageUrl.addEventListener('input', () => {
    if (pImageUrl.value.trim()) {
      pendingImageB64 = null;
      imgPreview.src = pImageUrl.value.trim();
      imgPreviewW.style.display = 'flex';
    } else {
      hideImagePreview();
    }
  });

  removeImgBtn.addEventListener('click', () => {
    pendingImageB64 = null;
    pImageUrl.value = '';
    hideImagePreview();
    pImageFile.value = '';
  });

  function hideImagePreview() {
    imgPreview.src = '';
    imgPreviewW.style.display = 'none';
  }

  /* ══════════════ DELETE ══════════════ */
  function confirmDelete(id, name) {
    deleteTarget = id;
    delName.textContent = name;
    delOverlay.classList.add('active');
  }

  delConfirm.addEventListener('click', () => {
    if (!deleteTarget) return;
    RozinaDB.remove(deleteTarget);
    deleteTarget = null;
    delOverlay.classList.remove('active');
    updateStats();
    renderTable();
    showToast('Product deleted');
  });

  delCancel.addEventListener('click', () => {
    deleteTarget = null;
    delOverlay.classList.remove('active');
  });

  delOverlay.addEventListener('click', e => {
    if (e.target === delOverlay) {
      deleteTarget = null;
      delOverlay.classList.remove('active');
    }
  });

  /* ══════════════ TOAST ══════════════ */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ── Utility ── */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ══════════════ BOOT ══════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    /* init views */
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-products').style.display = 'flex';
  });
})();
