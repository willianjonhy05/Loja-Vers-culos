/**
 * VERSÍCULOS - CORE ENGINE
 */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('versiculos_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        const response = await fetch('../produtos.json');
        allProducts = await response.json();
        
        updateCartBadge();
        
        // Router de renderização
        if(document.getElementById('featured-products')) renderProducts(allProducts.slice(0, 3), 'featured-products');
        if(document.getElementById('catalog-grid')) renderProducts(allProducts, 'catalog-grid');
        if(document.getElementById('cart-items-list')) renderCart();
        
        // Listeners
        const checkoutForm = document.getElementById('checkout-form');
        if(checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);

    } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
    }
}

// Renderiza os cards de produtos
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.imagem_url}" class="product-img" alt="${p.nome}">
            <div class="product-info">
                <div class="product-meta">${p.codigo} | ${p.cor}</div>
                <h3>${p.nome}</h3>
                <p class="product-meta" style="margin-bottom:5px">${p.material}</p>
                <span class="price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                
                <div class="size-selector">
                    <select id="size-${p.id}">
                        <option value="">Selecione o Tamanho</option>
                        ${p.tamanhos_disponiveis.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                
                <button class="btn-add" onclick="addToCart(${p.id})">Adicionar ao Carrinho</button>
            </div>
        </div>
    `).join('');
}

// Adicionar ao Carrinho
function addToCart(productId) {
    const sizeSelect = document.getElementById(`size-${productId}`);
    const selectedSize = sizeSelect.value;

    if (!selectedSize) {
        alert("Por favor, selecione um tamanho antes de adicionar.");
        return;
    }

    const product = allProducts.find(p => p.id === productId);
    
    // Verifica se já existe o mesmo produto com o mesmo tamanho
    const existingIndex = cart.findIndex(item => item.id === productId && item.tamanho === selectedSize);

    if (existingIndex > -1) {
        cart[existingIndex].quantidade += 1;
    } else {
        cart.push({
            ...product,
            tamanho: selectedSize,
            quantidade: 1
        });
    }

    saveCart();
    alert(`${product.nome} adicionado ao carrinho!`);
}

// Salvar no LocalStorage
function saveCart() {
    localStorage.setItem('versiculos_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Atualiza o contador visual
function updateCartBadge() {
    const badges = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((acc, item) => acc + item.quantidade, 0);
    badges.forEach(b => b.innerText = totalItems);
}

// Renderiza a lista do carrinho
function renderCart() {
    const container = document.getElementById('cart-items-list');
    const totalDisplay = document.getElementById('cart-total-value');
    
    if (cart.length === 0) {
        container.innerHTML = "<p>Seu carrinho está vazio.</p>";
        totalDisplay.innerText = "R$ 0,00";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.preco * item.quantidade;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.imagem_url}" class="cart-item-img">
                <div style="flex-grow:1">
                    <h4>${item.nome}</h4>
                    <small>Tamanho: ${item.tamanho} | R$ ${item.preco.toFixed(2)}</small>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.quantidade}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                        <button onclick="removeItem(${index})" style="margin-left:20px; color:red; border:none; background:none; cursor:pointer">Remover</button>
                    </div>
                </div>
                <strong>R$ ${itemTotal.toFixed(2)}</strong>
            </div>
        `;
    }).join('');

    totalDisplay.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function changeQty(index, delta) {
    cart[index].quantidade += delta;
    if (cart[index].quantidade <= 0) cart.splice(index, 1);
    saveCart();
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

// Checkout WhatsApp
function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    const nome = document.getElementById('cust_name').value;
    const email = document.getElementById('cust_email').value;
    const zapNumber = "5599999999999"; // Substitua pelo real

    let totalGeral = 0;
    let itensMsg = "";

    cart.forEach(item => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;
        itensMsg += `- ${item.quantidade}x ${item.nome} (Tamanho: ${item.tamanho}) - R$ ${subtotal.toFixed(2)}\n`;
    });

    const msg = `*NOVO PEDIDO - LOJA VERSÍCULOS*\n\n` +
                `*Cliente:* ${nome}\n` +
                `*E-mail:* ${email}\n\n` +
                `*Itens do Pedido:*\n${itensMsg}\n` +
                `*Valor Total:* R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

    const wpUrl = `https://wa.me/${zapNumber}?text=${encodeURIComponent(msg)}`;
    
    // Opcional: Limpar carrinho após pedido
    // localStorage.removeItem('versiculos_cart');
    
    window.open(wpUrl, '_blank');
}


    const anoEl = document.getElementById("ano-atual");
    if (anoEl) {
        anoEl.textContent = new Date().getFullYear();
    }