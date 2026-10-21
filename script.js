(() => {
  const isElement = (value) => value instanceof Element || value instanceof HTMLElement;

  const storageKey = 'epi-store-demo';
  const products = [
    { id: 'capacete-seguranca', name: 'Capacete de Segurança Classe B', image: 'image-13.png', price: 45.9, category: 'Proteção para cabeça', description: 'Capacete resistente e confortável para proteger contra impactos em ambientes industriais e de construção.' },
    { id: 'oculos-protecao', name: 'Óculos de Proteção Incolor', image: 'image-13-2.png', price: 24.9, category: 'Proteção ocular', description: 'Óculos de proteção incolor para ajudar a proteger os olhos contra partículas durante o trabalho.' },
    { id: 'protetor-auricular', name: 'Protetor Auricular tipo Concha', image: 'image-13-3.png', price: 32.9, category: 'Proteção auditiva', description: 'Protetor tipo concha com ajuste confortável para uso em ambientes com ruído.' },
    { id: 'luva-seguranca', name: 'Luva de Segurança', image: 'image-13-4.png', price: 18.9, category: 'Proteção para mãos', description: 'Luva de segurança para proteção das mãos em tarefas de manutenção e operação.' },
    { id: 'respirador-pff2', name: 'Respirador PFF2', image: 'image-13-5.png', price: 14.9, category: 'Proteção respiratória', description: 'Respirador PFF2 para proteção respiratória em atividades que exigem filtragem de partículas.' },
    { id: 'bota-seguranca', name: 'Bota de Segurança', image: 'image-13-6.png', price: 129.9, category: 'Proteção para pés', description: 'Bota de segurança resistente para apoiar a proteção e o conforto dos pés durante o expediente.' },
    { id: 'capacete-jugular', name: 'Capacete com Jugular Ajustável', image: 'image-13.png', price: 59.9, category: 'Proteção para cabeça', description: 'Capacete com jugular ajustável para manter o equipamento firme durante o trabalho.' },
    { id: 'oculos-ampla-visao', name: 'Óculos de Ampla Visão', image: 'image-13-2.png', price: 39.9, category: 'Proteção ocular', description: 'Óculos de ampla visão para maior cobertura e proteção dos olhos no ambiente de trabalho.' },
    { id: 'protetor-plug', name: 'Protetor Auricular tipo Plug', image: 'image-13-3.png', price: 9.9, category: 'Proteção auditiva', description: 'Protetor auricular tipo plug, compacto e prático para uso diário.' },
    { id: 'luva-nitrilica', name: 'Luva de Proteção Reforçada', image: 'image-13-4.png', price: 29.9, category: 'Proteção para mãos', description: 'Luva reforçada para oferecer proteção e firmeza durante tarefas manuais.' },
    { id: 'respirador-valvula', name: 'Respirador PFF2 com Válvula', image: 'image-13-5.png', price: 19.9, category: 'Proteção respiratória', description: 'Respirador PFF2 com válvula para maior conforto em atividades prolongadas.' },
    { id: 'bota-biqueira', name: 'Bota de Segurança com Biqueira', image: 'image-13-6.png', price: 159.9, category: 'Proteção para pés', description: 'Bota de segurança com biqueira para proteção adicional em ambientes de trabalho.' },
  ];

  const initialState = {
    cart: [],
    favorites: [],
    budgets: [],
    orders: [],
    address: {},
    signedIn: true,
  };

  const loadState = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return { ...initialState };
    try {
      return { ...initialState, ...JSON.parse(saved) };
    } catch (error) {
      console.error('Não foi possível ler os dados salvos da loja.', error);
      return { ...initialState };
    }
  };

  const state = loadState();
  let selectedProductId = products[0].id;
  let selectedQuantity = 1;
  let authTrack;
  const authScreenIds = ['box-175', 'box-199', 'box-211'];
  const saveState = () => {
    localStorage.setItem(storageKey, JSON.stringify(state));
    renderCartCount();
  };

  const formatPrice = (price) => price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const findProduct = (id) => products.find((product) => product.id === id);
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

  const setAuthScreen = (screenId) => {
    const index = authScreenIds.indexOf(screenId);
    if (index < 0 || !authTrack) return;
    authTrack.style.transform = `translateX(-${index * 1440}px)`;
    scrollToElement(document.querySelector('.auth-viewport'));
  };

  const scrollToElement = (element) => {
    element.scrollIntoView({ behavior: 'instant', block: 'start' });
  };

  const initAuthFlow = () => {
    const screens = authScreenIds.map((id) => document.getElementById(id));
    if (screens.some((screen) => !screen)) return;
    const viewport = document.createElement('div');
    viewport.className = 'auth-viewport';
    authTrack = document.createElement('div');
    authTrack.className = 'auth-track';
    screens[0].before(viewport);
    viewport.append(authTrack);
    screens.forEach((screen) => authTrack.append(screen));
  };

  const setProductCategory = (category) => {
    const categoryFilter = document.querySelector('#category-filter');
    categoryFilter.value = category;
    document.querySelectorAll('[data-category-option]').forEach((button) => {
      button.classList.toggle('is-selected', button.dataset.categoryOption === category);
    });
    filterProducts();
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      link.addEventListener('click', (event) => {
        if (authScreenIds.includes(targetId.slice(1))) {
          event.preventDefault();
          setAuthScreen(targetId.slice(1));
          return;
        }
        event.preventDefault();
        if (link.hasAttribute('data-store-category')) {
          setProductCategory(link.dataset.storeCategory);
        }
        scrollToElement(target);
      });
    });
  };

  const initFavorites = () => {
    document.querySelectorAll('.heart').forEach((heart) => {
      heart.setAttribute('role', 'button');
      heart.setAttribute('tabindex', '0');
      const productId = heart.closest('[data-product-id]')?.dataset.productId
        || (heart.closest('[data-product-detail]') ? products[0].id : null);
      heart.dataset.productId = productId || '';
      updateFavoriteButton(heart);
      heart.addEventListener('click', () => toggleFavorite(heart.dataset.productId));
      heart.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleFavorite(heart.dataset.productId);
        }
      });
    });
  };

  const updateFavoriteButton = (button) => {
    const active = state.favorites.includes(button.dataset.productId);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    button.setAttribute('aria-pressed', String(active));
  };

  const toggleFavorite = (productId) => {
    if (!productId) return;
    state.favorites = state.favorites.includes(productId)
      ? state.favorites.filter((id) => id !== productId)
      : [...state.favorites, productId];
    saveState();
    document.querySelectorAll(`[data-product-id="${productId}"] .favorite-button, .heart[data-product-id="${productId}"]`).forEach(updateFavoriteButton);
    const detailFavorite = document.querySelector('[data-detail-favorite]');
    if (detailFavorite?.dataset.productId === productId) {
      updateFavoriteButton(detailFavorite);
      detailFavorite.textContent = state.favorites.includes(productId) ? '♥ Favoritado' : '♡ Favoritar';
    }
    if (activeAccountView === 'favorites') renderAccount('favorites');
  };

  let activeAccountView = 'overview';

  const renderProductGrid = () => {
    const grid = document.querySelector('#product-grid');
    if (!grid) return;
    grid.innerHTML = products.map((product) => {
      const favorite = state.favorites.includes(product.id);
      return `<article class="store-product-card" data-product-id="${product.id}" data-category="${product.category}" data-price="${product.price}" data-search="${product.name.toLowerCase()} ${product.category.toLowerCase()}">
        <img src="./assets/${product.image}" alt="${product.name}">
        <button class="favorite-button${favorite ? ' is-active' : ''}" type="button" aria-label="${favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-pressed="${favorite}" data-favorite="${product.id}">♥</button>
        <p class="product-meta">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="product-add" type="button" data-add-to-cart="${product.id}">Adicionar ao carrinho</button>
        <button class="product-detail-link" type="button" data-product-detail-select="${product.id}">Ver detalhes</button>
      </article>`;
    }).join('');
    filterProducts();
  };

  const renderProductDetail = (product) => {
    if (!product) return;
    selectedProductId = product.id;
    selectedQuantity = 1;
    const detail = document.querySelector('[data-product-detail]');
    detail.dataset.productId = product.id;
    detail.querySelector('[data-product-name]').textContent = product.name;
    detail.querySelector('[data-product-price]').textContent = formatPrice(product.price);
    detail.querySelector('[data-product-description]').textContent = product.description;
    detail.querySelector('.epis-2').textContent = product.category;
    detail.querySelector('.protecao-da-cabeca').textContent = product.category;
    detail.querySelectorAll('[data-product-image]').forEach((image) => {
      image.src = `./assets/${product.image}`;
      image.alt = product.name;
    });
    const quantity = detail.querySelector('.text-5');
    quantity.textContent = String(selectedQuantity);
    quantity.dataset.value = String(selectedQuantity);
    const favoriteButton = detail.querySelector('[data-detail-favorite]');
    favoriteButton.dataset.productId = product.id;
    updateFavoriteButton(favoriteButton);
    favoriteButton.textContent = state.favorites.includes(product.id) ? '♥ Favoritado' : '♡ Favoritar';
  };

  const openProductDetail = (productId) => {
    const product = findProduct(productId);
    if (!product) return;
    const detail = document.querySelector('[data-product-detail]');
    detail.hidden = false;
    renderProductDetail(product);
    scrollToElement(detail);
  };

  const filterProducts = () => {
    const query = document.querySelector('#product-search')?.value.trim().toLocaleLowerCase('pt-BR') || '';
    const category = document.querySelector('#category-filter')?.value || '';
    const maxPrice = Number(document.querySelector('#price-filter')?.value) || Infinity;
    const sort = document.querySelector('#product-sort')?.value || 'featured';
    const grid = document.querySelector('#product-grid');
    const cards = [...grid.querySelectorAll('.store-product-card')];

    cards.sort((first, second) => {
      if (sort === 'price-asc') return Number(first.dataset.price) - Number(second.dataset.price);
      if (sort === 'price-desc') return Number(second.dataset.price) - Number(first.dataset.price);
      if (sort === 'name') return first.querySelector('h3').textContent.localeCompare(second.querySelector('h3').textContent, 'pt-BR');
      return products.findIndex((product) => product.id === first.dataset.productId)
        - products.findIndex((product) => product.id === second.dataset.productId);
    });

    let visibleCount = 0;
    cards.forEach((card) => {
      const matches = card.dataset.search.includes(query)
        && (!category || card.dataset.category === category)
        && Number(card.dataset.price) <= maxPrice;
      card.hidden = !matches;
      if (matches) visibleCount += 1;
      grid.append(card);
    });
    document.querySelector('#product-empty').hidden = visibleCount > 0;
  };

  const renderCartCount = () => {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((badge) => {
      badge.textContent = String(count);
    });
  };

  const renderCart = () => {
    const container = document.querySelector('#cart-items');
    if (!container) return;
    container.innerHTML = state.cart.map((item) => {
      const product = findProduct(item.id);
      if (!product) return '';
      return `<article class="cart-item" data-cart-item="${product.id}">
        <img src="./assets/${product.image}" alt="">
        <div><h3>${product.name}</h3><p>${formatPrice(product.price * item.quantity)}</p>
          <div class="cart-quantity">
            <button type="button" data-cart-change="-1" data-product-id="${product.id}" aria-label="Diminuir quantidade">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-change="1" data-product-id="${product.id}" aria-label="Aumentar quantidade">+</button>
            <button class="cart-remove" type="button" data-cart-remove="${product.id}">Remover</button>
          </div>
        </div>
      </article>`;
    }).join('') || '<p class="account-empty">Seu carrinho está vazio. Adicione produtos para continuar.</p>';
    const total = state.cart.reduce((sum, item) => sum + (findProduct(item.id)?.price || 0) * item.quantity, 0);
    document.querySelector('#cart-total').textContent = `Total estimado: ${formatPrice(total)}`;
    renderCartCount();
  };

  const addToCart = (productId, quantity = 1) => {
    if (!findProduct(productId)) return;
    const item = state.cart.find((entry) => entry.id === productId);
    if (item) item.quantity += quantity;
    else state.cart.push({ id: productId, quantity });
    saveState();
    renderCart();
    document.querySelector('#cart-panel').hidden = false;
  };

  const createRecord = (collection, status) => {
    if (!state.cart.length) {
      document.querySelector('.cart-feedback').textContent = 'Adicione pelo menos um produto ao carrinho.';
      return;
    }
    const items = state.cart.map((item) => ({ ...item }));
    const record = {
      id: `${collection === 'budgets' ? 'ORC' : 'PED'}-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status,
      items,
    };
    state[collection].unshift(record);
    state.cart = [];
    saveState();
    renderCart();
    document.querySelector('.cart-feedback').textContent = collection === 'budgets'
      ? `Solicitação ${record.id} salva neste navegador.`
      : `Pedido demonstrativo ${record.id} salvo neste navegador.`;
    renderAccount(collection);
  };

  const renderAccount = (view = activeAccountView) => {
    activeAccountView = view;
    const content = document.querySelector('#account-content');
    if (!content) return;
    document.querySelectorAll('.account-tab').forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.accountView === view);
    });

    if (view === 'signout') {
      state.signedIn = false;
      saveState();
      activeAccountView = 'overview';
      document.querySelector('.account-sidebar').hidden = true;
      content.innerHTML = '<h1>Sessão encerrada</h1><p>Esta demonstração não tem autenticação real. Entre novamente pela tela de acesso.</p><a class="account-action" href="#box-175">Ir para entrar</a>';
      return;
    }

    document.querySelector('.account-sidebar').hidden = false;
    if (view === 'overview') {
      content.innerHTML = `<h1>Minha conta</h1><p>Resumo dos dados guardados localmente neste navegador.</p>
        <div class="account-cards">
          <div class="account-summary-card">Orçamentos<strong>${state.budgets.length}</strong></div>
          <div class="account-summary-card">Pedidos<strong>${state.orders.length}</strong></div>
          <div class="account-summary-card">Favoritos<strong>${state.favorites.length}</strong></div>
        </div><div class="account-panel-card"><h2>Seus dados</h2><p>Os registros desta demonstração ficam apenas neste navegador e não são enviados para uma loja.</p></div>`;
      return;
    }

    if (view === 'address') {
      const address = state.address || {};
      content.innerHTML = `<h1>Endereço</h1><p>Salve seu endereço para consultar nesta demonstração.</p>
        <form class="address-form">
          <label>Nome do destinatário<input name="recipient" autocomplete="name" value="${escapeHtml(address.recipient)}" required></label>
          <label>CEP<input name="postalCode" autocomplete="postal-code" value="${escapeHtml(address.postalCode)}" required></label>
          <label>Rua e número<input name="street" autocomplete="street-address" value="${escapeHtml(address.street)}" required></label>
          <label>Complemento<input name="complement" value="${escapeHtml(address.complement)}"></label>
          <label>Cidade<input name="city" autocomplete="address-level2" value="${escapeHtml(address.city)}" required></label>
          <label>Estado<input name="region" autocomplete="address-level1" maxlength="2" value="${escapeHtml(address.region)}" required></label>
          <button type="submit">Salvar endereço</button>
          <p class="address-feedback" role="status" aria-live="polite"></p>
        </form>`;
      content.querySelector('.address-form').addEventListener('submit', (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        state.address = Object.fromEntries(new FormData(event.currentTarget));
        saveState();
        content.querySelector('.address-feedback').textContent = 'Endereço salvo neste navegador.';
      });
      return;
    }

    if (view === 'favorites') {
      const favorites = state.favorites.map(findProduct).filter(Boolean);
      content.innerHTML = `<h1>Favoritos</h1><p>Produtos que você marcou como favoritos.</p>${favorites.length
        ? `<div class="account-list">${favorites.map((product) => `<article class="account-list-item"><img src="./assets/${product.image}" alt=""><div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p></div><button class="account-action" type="button" data-add-to-cart="${product.id}">Adicionar ao carrinho</button></article>`).join('')}</div>`
        : '<p class="account-empty">Você ainda não favoritou nenhum produto.</p>'}`;
      return;
    }

    const records = state[view] || [];
    const title = view === 'budgets' ? 'Orçamentos' : 'Pedidos';
    content.innerHTML = `<h1>${title}</h1><p>${view === 'budgets' ? 'Solicitações de orçamento feitas nesta demonstração.' : 'Pedidos demonstrativos registrados neste navegador.'}</p>
      <input class="account-record-search" type="search" placeholder="Buscar ${title.toLocaleLowerCase('pt-BR')}..." aria-label="Buscar ${title.toLocaleLowerCase('pt-BR')}">
      ${records.length
      ? `<div class="account-list">${records.map((record) => `<article class="account-panel-card account-record" data-record-search="${escapeHtml(`${record.id} ${record.status} ${record.details || ''} ${(record.items || []).map((item) => findProduct(item.id)?.name || '').join(' ')}`.toLocaleLowerCase('pt-BR'))}"><h3>${record.id} · ${record.date}</h3><p>Status: ${record.status}</p>${record.details ? `<p>${escapeHtml(record.details)}</p>` : ''}<ul>${(record.items || []).map((item) => {
        const product = findProduct(item.id);
        return product ? `<li>${escapeHtml(product.name)} — ${item.quantity} un. (${formatPrice(product.price * item.quantity)})</li>` : '';
      }).join('')}</ul></article>`).join('')}</div>`
      : '<p class="account-empty">Ainda não há registros. Adicione produtos ao carrinho e solicite um orçamento ou registre um pedido demonstrativo.</p>'}`;
    content.querySelector('.account-record-search').addEventListener('input', (event) => {
      const query = event.currentTarget.value.trim().toLocaleLowerCase('pt-BR');
      content.querySelectorAll('.account-record').forEach((record) => {
        record.hidden = !record.dataset.recordSearch.includes(query);
      });
    });
  };
  const initAddToCartButtons = () => {
    document.querySelector('[data-detail-add]').addEventListener('click', () => {
      addToCart(selectedProductId, selectedQuantity);
    });

    document.querySelector('[data-detail-favorite]').addEventListener('click', (event) => {
      const button = event.currentTarget;
      toggleFavorite(button.dataset.productId);
      button.textContent = state.favorites.includes(button.dataset.productId) ? '♥ Favoritado' : '♡ Favoritar';
    });
  };

  const initQuantityControls = () => {
    document.querySelector('.box-83').addEventListener('click', (event) => {
      const button = event.target.closest('[data-detail-quantity]');
      if (!button) return;
      selectedQuantity = Math.max(1, selectedQuantity + Number(button.dataset.detailQuantity));
      const quantity = document.querySelector('.text-5');
      quantity.textContent = String(selectedQuantity);
      quantity.dataset.value = String(selectedQuantity);
    });

    document.querySelectorAll('[data-category-option]').forEach((button) => {
      button.addEventListener('click', () => {
        setProductCategory(button.dataset.categoryOption);
        scrollToElement(document.querySelector('#box-35'));
      });
    });
  };

  const initForms = () => {
    document.querySelectorAll('[data-demo-form]').forEach((form) => {
      const phone = form.elements.namedItem('phone');
      const validatePhone = () => {
        if (!phone) return;
        const digitCount = phone.value.replace(/\D/g, '').length;
        phone.setCustomValidity(
          digitCount === 0 || (digitCount >= 10 && digitCount <= 13)
            ? ''
            : 'Informe um telefone válido com DDD.',
        );
      };
      phone?.addEventListener('input', validatePhone);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        validatePhone();

        const password = form.elements.namedItem('password');
        const confirmPassword = form.elements.namedItem('confirmPassword');
        if (password && confirmPassword) {
          confirmPassword.setCustomValidity(
            password.value === confirmPassword.value ? '' : 'As senhas não coincidem.',
          );
        }

        if (!form.reportValidity()) return;

        const feedback = form.querySelector('.form-feedback');
        if (form.classList.contains('contact-form')) {
          const values = Object.fromEntries(new FormData(form));
          state.budgets.unshift({
            id: `ORC-${Date.now().toString().slice(-6)}`,
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'Solicitação recebida',
            items: [],
            details: `${values.name} · ${values.company} · ${values.phone} · ${values.quantity || 'Quantidade não informada'} · ${values.interest}`,
          });
          saveState();
        }

        if (form.classList.contains('login-form')) {
          state.signedIn = true;
          saveState();
        }

        if (feedback) {
          feedback.textContent = form.classList.contains('login-form')
            ? 'Dados validados. Esta demonstração não autentica em um servidor.'
            : form.classList.contains('contact-form')
              ? 'Solicitação salva localmente. O envio ao vendedor não está conectado.'
              : form.classList.contains('signup-form')
                ? 'Dados validados. O cadastro não está conectado a um servidor.'
                : 'Dados validados. O envio não está conectado a um servidor.';
        }
      });
    });
  };

  const initStoreInteractions = () => {
    const cartPanel = document.querySelector('#cart-panel');
    renderProductGrid();
    renderCart();
    document.querySelector('#product-search').addEventListener('input', filterProducts);
    document.querySelector('#category-filter').addEventListener('change', filterProducts);
    document.querySelector('#price-filter').addEventListener('change', filterProducts);
    document.querySelector('#product-sort').addEventListener('change', filterProducts);
    document.querySelector('#category-filter').addEventListener('change', () => {
      document.querySelectorAll('[data-category-option]').forEach((button) => {
        button.classList.toggle('is-selected', button.dataset.categoryOption === document.querySelector('#category-filter').value);
      });
    });
    document.querySelector('#clear-filters').addEventListener('click', () => {
      document.querySelector('#product-search').value = '';
      document.querySelector('#category-filter').value = '';
      document.querySelector('#price-filter').value = '';
      document.querySelector('#product-sort').value = 'featured';
      document.querySelectorAll('[data-category-option]').forEach((button) => button.classList.remove('is-selected'));
      filterProducts();
    });

    document.querySelector('#product-grid').addEventListener('click', (event) => {
      const favoriteButton = event.target.closest('[data-favorite]');
      if (favoriteButton) {
        toggleFavorite(favoriteButton.dataset.favorite);
        return;
      }
      const detailButton = event.target.closest('[data-product-detail-select]');
      if (detailButton) {
        openProductDetail(detailButton.dataset.productDetailSelect);
        return;
      }
      const addButton = event.target.closest('[data-add-to-cart]');
      if (addButton) addToCart(addButton.dataset.addToCart);
    });

    document.querySelectorAll('.header-cart-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        renderCart();
        cartPanel.hidden = false;
      });
    });
    cartPanel.addEventListener('click', (event) => {
      if (event.target.closest('[data-close-cart]')) {
        cartPanel.hidden = true;
        return;
      }
      const removeButton = event.target.closest('[data-cart-remove]');
      if (removeButton) {
        state.cart = state.cart.filter((item) => item.id !== removeButton.dataset.cartRemove);
        saveState();
        renderCart();
        return;
      }
      const quantityButton = event.target.closest('[data-cart-change]');
      if (quantityButton) {
        const item = state.cart.find((entry) => entry.id === quantityButton.dataset.productId);
        if (!item) return;
        item.quantity += Number(quantityButton.dataset.cartChange);
        if (item.quantity < 1) state.cart = state.cart.filter((entry) => entry !== item);
        saveState();
        renderCart();
      }
    });
    document.querySelector('.cart-quote').addEventListener('click', () => createRecord('budgets', 'Solicitação recebida'));
    document.querySelector('.cart-order').addEventListener('click', () => createRecord('orders', 'Pedido demonstrativo'));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') cartPanel.hidden = true;
    });
  };

  const initAccount = () => {
    renderAccount();
    document.querySelector('.account-sidebar').addEventListener('click', (event) => {
      const tab = event.target.closest('[data-account-view]');
      if (tab) renderAccount(tab.dataset.accountView);
    });
    document.querySelectorAll('.header-account-link').forEach((link) => {
      link.addEventListener('click', () => {
        document.querySelector('.account-sidebar').hidden = false;
        renderAccount('overview');
      });
    });
    document.querySelector('#account-content').addEventListener('click', (event) => {
      const addButton = event.target.closest('[data-add-to-cart]');
      if (addButton) addToCart(addButton.dataset.addToCart);
    });
  };

  const initCategorySelection = () => {
    const buttons = [...document.querySelectorAll('.box-44, .box-50, .box-48')];

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
      });
    });
  };

  const init = () => {
    initAuthFlow();
    initStoreInteractions();
    initAccount();
    renderProductDetail(products[0]);
    initSmoothScroll();
    initFavorites();
    initAddToCartButtons();
    initQuantityControls();
    initForms();
    initCategorySelection();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
