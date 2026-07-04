/* ═══════════════════════════════════════════
   ROZINA SIGNATURE LIVING — Shared Data Layer
   ═══════════════════════════════════════════ */

const RozinaDB = (() => {
  const PRODUCTS_KEY = 'rozina_products';

  /* ── Seed data shown before admin adds real products ── */
  const SEED_PRODUCTS = [
    {
      id: 'seed-001',
      name: 'Venetian King Bed Frame',
      category: 'beds',
      description: 'Solid mahogany frame with hand-carved headboard detailing. Fits standard king mattress. Available in dark walnut and ebony finishes.',
      price: 68000,
      oldPrice: 82000,
      stock: 5,
      image: '',
      featured: true,
      isNew: false,
      createdAt: Date.now() - 8640000 * 10,
    },
    {
      id: 'seed-002',
      name: 'Oslo Dining Table',
      category: 'tables',
      description: 'Minimalist solid oak dining table with tapered legs. Seats 6 comfortably. Dimensions: 180cm × 90cm.',
      price: 54000,
      oldPrice: null,
      stock: 3,
      image: '',
      featured: true,
      isNew: true,
      createdAt: Date.now() - 8640000 * 5,
    },
    {
      id: 'seed-003',
      name: 'Chester Wing Chair',
      category: 'chairs',
      description: 'Classic wingback chair upholstered in premium velvet fabric. Solid timber legs. Ideal for living rooms and studies.',
      price: 32000,
      oldPrice: 38000,
      stock: 8,
      image: '',
      featured: false,
      isNew: false,
      createdAt: Date.now() - 8640000 * 3,
    },
    {
      id: 'seed-004',
      name: 'Napoli 3-Seater Sofa',
      category: 'sofas',
      description: 'Deep-seated Italian-inspired sofa with feather-blend cushions. Full-grain leather in cognac, charcoal and ivory.',
      price: 95000,
      oldPrice: null,
      stock: 2,
      image: '',
      featured: true,
      isNew: true,
      createdAt: Date.now() - 8640000 * 1,
    },
    {
      id: 'seed-005',
      name: 'Brass Arc Floor Lamp',
      category: 'accessories',
      description: 'Mid-century arc floor lamp with brushed brass finish. Adjustable head. 1.8m height. E27 bulb compatible.',
      price: 14500,
      oldPrice: 18000,
      stock: 12,
      image: '',
      featured: false,
      isNew: true,
      createdAt: Date.now() - 8640000 * 2,
    },
    {
      id: 'seed-006',
      name: 'Nordic Coffee Table',
      category: 'tables',
      description: 'Low-profile solid pine coffee table with open shelf. Scandi-inspired clean lines. 110cm × 60cm.',
      price: 22000,
      oldPrice: null,
      stock: 6,
      image: '',
      featured: false,
      isNew: false,
      createdAt: Date.now() - 8640000 * 7,
    },
    {
      id: 'seed-007',
      name: 'Executive Office Chair',
      category: 'chairs',
      description: 'High-back ergonomic chair with lumbar support, adjustable armrests and breathable mesh back. Max load: 120kg.',
      price: 28000,
      oldPrice: 33000,
      stock: 7,
      image: '',
      featured: false,
      isNew: false,
      createdAt: Date.now() - 8640000 * 4,
    },
    {
      id: 'seed-008',
      name: 'Terracotta Ceramic Vase Set',
      category: 'accessories',
      description: 'Set of 3 hand-thrown ceramic vases in earthy terracotta glaze. Heights: 15cm, 22cm, 30cm.',
      price: 5800,
      oldPrice: null,
      stock: 20,
      image: '',
      featured: false,
      isNew: true,
      createdAt: Date.now() - 8640000 * 6,
    },
  ];

  /* ── Helpers ── */
  function getAll() {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      if (!raw) {
        /* first visit: write seed data */
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
        return [...SEED_PRODUCTS];
      }
      return JSON.parse(raw);
    } catch {
      return [...SEED_PRODUCTS];
    }
  }

  function saveAll(products) {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return true;
    } catch {
      return false;
    }
  }

  function getById(id) {
    return getAll().find(p => p.id === id) || null;
  }

  function add(data) {
    const products = getAll();
    const product = {
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      price: Number(data.price),
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      stock: Number(data.stock),
      image: data.image || '',
      featured: Boolean(data.featured),
      isNew: data.isNew !== undefined ? Boolean(data.isNew) : true,
      createdAt: Date.now(),
    };
    products.unshift(product);
    saveAll(products);
    return product;
  }

  function update(id, data) {
    const products = getAll();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    products[idx] = {
      ...products[idx],
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      price: Number(data.price),
      oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
      stock: Number(data.stock),
      image: data.image !== undefined ? data.image : products[idx].image,
      featured: Boolean(data.featured),
      isNew: Boolean(data.isNew),
      updatedAt: Date.now(),
    };
    saveAll(products);
    return products[idx];
  }

  function remove(id) {
    const products = getAll().filter(p => p.id !== id);
    saveAll(products);
  }

  function formatPrice(num) {
    return 'KSh ' + Number(num).toLocaleString('en-KE');
  }

  function placeholderSVG() {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23ece9e3'/%3E%3Cpath d='M170 130h60v40h-60z' fill='%23c8c2ba' opacity='.5'/%3E%3Ccircle cx='200' cy='118' r='14' fill='%23c8c2ba' opacity='.5'/%3E%3C/svg%3E`;
  }

  return { getAll, getById, add, update, remove, formatPrice, placeholderSVG };
})();
