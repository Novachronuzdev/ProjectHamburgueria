/**
 * BRASA & SMASH - BURGER ARTESANAL
 * Interactive Shopping Cart & WhatsApp Order Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    cart: [],
    whatsappNumber: '5511999998888', // Número fictício de exemplo (configurável)
    freeDeliveryThreshold: 70.0,
    deliveryFee: 6.0
  };

  // DOM Elements
  const cartBtn = document.getElementById('cart-btn');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartEmptyMessage = document.getElementById('cart-empty-message');
  const cartBadgeCount = document.getElementById('cart-badge-count');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartDeliveryEl = document.getElementById('cart-delivery');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const navMenu = document.getElementById('nav-menu');

  // Format Currency (BRL)
  const formatBRL = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Toast Notification
  const showToast = (message) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🔥</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // Cart Drawer Control
  const openCart = () => {
    cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    cartBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) closeCart();
    });
  }

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartBackdrop.classList.contains('open')) {
      closeCart();
    }
  });

  // Mobile Menu Toggle
  if (mobileToggleBtn && navMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileToggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Close menu when clicking nav-link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggleBtn.innerHTML = '☰';
      });
    });
  }

  // Add Item to Cart
  window.addToCart = (id, name, price, image) => {
    const existingIndex = state.cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += 1;
    } else {
      state.cart.push({
        id,
        name,
        price: parseFloat(price),
        image,
        quantity: 1
      });
    }

    renderCart();
    showToast(`${name} adicionado ao pedido!`);
    openCart();
  };

  // Update Item Quantity
  window.updateQuantity = (id, delta) => {
    const item = state.cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.id !== id);
    }

    renderCart();
  };

  // Remove Item
  window.removeItem = (id) => {
    const item = state.cart.find(i => i.id === id);
    state.cart = state.cart.filter(i => i.id !== id);
    renderCart();
    if (item) {
      showToast(`${item.name} removido.`);
    }
  };

  // Render Cart UI
  const renderCart = () => {
    // Total count of units
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadgeCount.textContent = totalCount;
    cartBadgeCount.style.display = totalCount > 0 ? 'flex' : 'none';

    if (state.cart.length === 0) {
      cartEmptyMessage.style.display = 'block';
      cartItemsContainer.style.display = 'none';
      cartSubtotalEl.textContent = formatBRL(0);
      cartDeliveryEl.textContent = formatBRL(0);
      cartTotalEl.textContent = formatBRL(0);
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.pointerEvents = 'none';
      return;
    }

    cartEmptyMessage.style.display = 'none';
    cartItemsContainer.style.display = 'flex';
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.pointerEvents = 'auto';

    // Build Cart Items HTML
    cartItemsContainer.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">${formatBRL(item.price * item.quantity)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)" title="Diminuir">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)" title="Aumentar">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeItem('${item.id}')" title="Excluir">✕</button>
      </div>
    `).join('');

    // Calculations
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isFreeDelivery = subtotal >= state.freeDeliveryThreshold;
    const finalDelivery = isFreeDelivery ? 0 : state.deliveryFee;
    const total = subtotal + finalDelivery;

    cartSubtotalEl.textContent = formatBRL(subtotal);
    cartDeliveryEl.innerHTML = isFreeDelivery
      ? '<span style="color:#10b981;font-weight:700">GRÁTIS 🎉</span>'
      : formatBRL(finalDelivery);
    cartTotalEl.textContent = formatBRL(total);
  };

  // Checkout via WhatsApp
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) return;

      const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const isFreeDelivery = subtotal >= state.freeDeliveryThreshold;
      const finalDelivery = isFreeDelivery ? 0 : state.deliveryFee;
      const total = subtotal + finalDelivery;

      // Form inputs
      const nameInput = document.getElementById('customer-name');
      const addressInput = document.getElementById('customer-address');
      const paymentInput = document.getElementById('payment-method');
      const notesInput = document.getElementById('order-notes');

      const customerName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Cliente';
      const address = addressInput && addressInput.value.trim() ? addressInput.value.trim() : 'Retirada no Balcão / A combinar';
      const paymentMethod = paymentInput ? paymentInput.value : 'Pix';
      const notes = notesInput && notesInput.value.trim() ? notesInput.value.trim() : 'Sem observações';

      // Build WhatsApp message
      let message = `🍔 *NOVO PEDIDO - BRASA & SMASH BURGER* 🍔\n`;
      message += `----------------------------------------\n`;
      message += `👤 *Cliente:* ${customerName}\n`;
      message += `📍 *Endereço:* ${address}\n`;
      message += `💳 *Pagamento:* ${paymentMethod}\n`;
      message += `📝 *Observações:* ${notes}\n`;
      message += `----------------------------------------\n`;
      message += `*ITENS DO PEDIDO:*\n`;

      state.cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} (${formatBRL(item.price * item.quantity)})\n`;
      });

      message += `----------------------------------------\n`;
      message += `Subtotal: ${formatBRL(subtotal)}\n`;
      message += `Taxa de Entrega: ${isFreeDelivery ? 'GRÁTIS' : formatBRL(finalDelivery)}\n`;
      message += `🔥 *TOTAL A PAGAR: ${formatBRL(total)}*\n`;
      message += `----------------------------------------\n`;
      message += `Por favor, confirmem o recebimento e o tempo estimado! 🙏`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${state.whatsappNumber}&text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  // Smooth scroll for nav anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Initial cart render
  renderCart();
});
