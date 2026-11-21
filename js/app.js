/**
 * Aplicação Principal do Sistema de Orçamentos
 * Titular: João Santos | NIF: 269413448
 * Otimizado para Mobile (Telemóvel) e Desktop
 */

// Chaves de armazenamento LocalStorage
const STORAGE_KEYS = {
  PROFILE: 'orc_joao_santos_profile',
  CATALOG: 'orc_joao_santos_catalog',
  SAVED_QUOTES: 'orc_joao_santos_history',
  CURRENT_DRAFT: 'orc_joao_santos_current_draft',
  SEQUENCE: 'orc_joao_santos_next_sequence'
};

// Gerador e Gestor de Numeração Sequencial Profissional (Ex: ORC-2026/001)
function getNextSequentialQuoteNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = (state.profile?.seriesPrefix || "ORC").trim().toUpperCase();

  // 1. Procurar o maior número existente no histórico para este ano e prefixo
  let maxSeq = 0;
  if (state.savedQuotes && state.savedQuotes.length > 0) {
    const regex = new RegExp(`^${prefix}-${currentYear}/(\\d+)$`, 'i');
    state.savedQuotes.forEach(q => {
      if (q && q.number) {
        const match = String(q.number).trim().match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    });
  }

  // 2. Verificar contador persistido em localStorage
  const storedSeqKey = `${STORAGE_KEYS.SEQUENCE}_${currentYear}`;
  const storedSeq = parseInt(localStorage.getItem(storedSeqKey), 10);
  let nextSeq = 1;
  if (!isNaN(storedSeq) && storedSeq > 0) {
    nextSeq = Math.max(maxSeq + 1, storedSeq);
  } else {
    nextSeq = maxSeq + 1;
  }

  return `${prefix}-${currentYear}/${String(nextSeq).padStart(3, '0')}`;
}

function updateSequenceAfterSave(quoteNumber) {
  if (!quoteNumber) return;
  const currentYear = new Date().getFullYear();
  const prefix = (state.profile?.seriesPrefix || "ORC").trim().toUpperCase();
  const regex = new RegExp(`^${prefix}-${currentYear}/(\\d+)$`, 'i');
  const match = String(quoteNumber).trim().match(regex);
  if (match) {
    const savedNum = parseInt(match[1], 10);
    if (!isNaN(savedNum)) {
      const storedSeqKey = `${STORAGE_KEYS.SEQUENCE}_${currentYear}`;
      const currentStored = parseInt(localStorage.getItem(storedSeqKey), 10) || 0;
      if (savedNum >= currentStored) {
        localStorage.setItem(storedSeqKey, String(savedNum + 1));
      }
    }
  }
}

// Estado da Aplicação
let state = {
  profile: null,
  catalog: null,
  savedQuotes: [],
  currentQuote: {
    id: generateUUID(),
    number: "",
    issueDate: new Date().toISOString().split('T')[0],
    validUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    client: {
      name: "",
      nif: "",
      email: "",
      phone: "",
      address: ""
    },
    items: [],
    discountGlobal: 0,
    vatExemption: "none",
    irsRetentionRate: 0,
    paymentTerms: "",
    notes: ""
  }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  initializeUI();
  renderAll();

  // Gerir redimensionamento da janela para assegurar visibilidade correta
  window.addEventListener('resize', handleWindowResize);
});

// Alternador de Abas Mobile (Editor vs Preview)
function switchMobileView(view) {
  const viewEditor = document.getElementById('viewEditor');
  const viewPreview = document.getElementById('viewPreview');
  const btnEditor = document.getElementById('tabBtnEditor');
  const btnPreview = document.getElementById('tabBtnPreview');

  if (view === 'editor') {
    viewEditor.classList.remove('hidden');
    viewPreview.classList.add('hidden');
    btnEditor.classList.add('active', 'text-blue-900');
    btnEditor.classList.remove('text-slate-600');
    btnPreview.classList.remove('active', 'text-blue-900');
    btnPreview.classList.add('text-slate-600');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    viewEditor.classList.add('hidden');
    viewPreview.classList.remove('hidden');
    btnPreview.classList.add('active', 'text-blue-900');
    btnPreview.classList.remove('text-slate-600');
    btnEditor.classList.remove('active', 'text-blue-900');
    btnEditor.classList.add('text-slate-600');
    updatePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleWindowResize() {
  if (window.innerWidth >= 1024) {
    document.getElementById('viewEditor')?.classList.remove('hidden');
    document.getElementById('viewPreview')?.classList.remove('hidden');
  }
}

// Drawer de Menu Mobile
function toggleMobileMenu() {
  const drawer = document.getElementById('mobileMenuDrawer');
  if (drawer) {
    drawer.classList.toggle('hidden');
  }
}

// Carrega dados salvos ou defaults
function loadStoredData() {
  try {
    const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    state.profile = storedProfile ? JSON.parse(storedProfile) : { ...DEFAULT_PROFILE };

    // Sincronizar dados reais de João Santos caso o perfil ainda contenha dados de exemplo
    if (state.profile.email === "contato@joaosantos.pt" || (state.profile.iban && state.profile.iban.includes("0000 0000")) || !state.profile.impic) {
      state.profile.phone = DEFAULT_PROFILE.phone;
      state.profile.email = DEFAULT_PROFILE.email;
      state.profile.iban = DEFAULT_PROFILE.iban;
      state.profile.bankName = DEFAULT_PROFILE.bankName;
      state.profile.impic = DEFAULT_PROFILE.impic;
      state.profile.defaultIrsRetention = DEFAULT_PROFILE.defaultIrsRetention;
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
    }

    const storedCatalog = localStorage.getItem(STORAGE_KEYS.CATALOG);
    state.catalog = storedCatalog ? JSON.parse(storedCatalog) : [...DEFAULT_CATALOG];

    const storedHistory = localStorage.getItem(STORAGE_KEYS.SAVED_QUOTES);
    state.savedQuotes = storedHistory ? JSON.parse(storedHistory) : [];

    // Preencher número sequencial inicial se estiver vazio ou com formato aleatório antigo
    if (!state.currentQuote.number || /^ORC-\d{4}\/\d{3}$/.test(state.currentQuote.number) === false) {
      state.currentQuote.number = getNextSequentialQuoteNumber();
    }

    // Preencher campos padrão se estiver vazio
    if (state.currentQuote.items.length === 0) {
      state.currentQuote.paymentTerms = state.profile.defaultPaymentTerms || "";
      state.currentQuote.notes = state.profile.notes || "";
      state.currentQuote.vatExemption = state.profile.defaultVatExemption || "none";
      state.currentQuote.irsRetentionRate = state.profile.defaultIrsRetention || 0;

      // Adiciona um primeiro item demonstrativo amigável
      addItemFromPreset(state.catalog[0]?.items[0]);
    }
  } catch (err) {
    console.error("Erro ao carregar dados do LocalStorage:", err);
    state.profile = { ...DEFAULT_PROFILE };
    state.catalog = [...DEFAULT_CATALOG];
  }
}

// Inicializa Eventos da Interface
function initializeUI() {
  // Atualizações automáticas de campos nos inputs
  document.getElementById('quoteNumber').addEventListener('input', (e) => {
    state.currentQuote.number = e.target.value;
    updatePreview();
  });
  document.getElementById('issueDate').addEventListener('change', (e) => {
    state.currentQuote.issueDate = e.target.value;
    updatePreview();
  });
  document.getElementById('validUntilDate').addEventListener('change', (e) => {
    state.currentQuote.validUntilDate = e.target.value;
    updatePreview();
  });

  // Dados do Cliente
  document.getElementById('clientName').addEventListener('input', (e) => {
    state.currentQuote.client.name = e.target.value;
    updatePreview();
  });
  document.getElementById('clientNif').addEventListener('input', (e) => {
    state.currentQuote.client.nif = e.target.value.trim();
    validateClientNifFeedback(e.target.value.trim());
    updatePreview();
  });
  document.getElementById('clientEmail').addEventListener('input', (e) => {
    state.currentQuote.client.email = e.target.value;
    updatePreview();
  });
  document.getElementById('clientPhone').addEventListener('input', (e) => {
    state.currentQuote.client.phone = e.target.value;
    updatePreview();
  });
  document.getElementById('clientAddress').addEventListener('input', (e) => {
    state.currentQuote.client.address = e.target.value;
    updatePreview();
  });

  // Opções de Impostos e Condições
  document.getElementById('vatExemptionSelect').addEventListener('change', (e) => {
    state.currentQuote.vatExemption = e.target.value;
    recalculateTotals();
    updatePreview();
  });
  document.getElementById('irsRetentionSelect').addEventListener('change', (e) => {
    state.currentQuote.irsRetentionRate = parseFloat(e.target.value) || 0;
    recalculateTotals();
    updatePreview();
  });
  document.getElementById('paymentTermsInput').addEventListener('input', (e) => {
    state.currentQuote.paymentTerms = e.target.value;
    updatePreview();
  });
  document.getElementById('notesInput').addEventListener('input', (e) => {
    state.currentQuote.notes = e.target.value;
    updatePreview();
  });
}

// Validador de NIF de Portugal (Módulo 11)
function isValidPortugueseNif(nif) {
  if (!nif) return false;
  const cleanNif = nif.replace(/\s+/g, '');
  if (!/^\d{9}$/.test(cleanNif)) return false;

  const firstDigit = cleanNif.charAt(0);
  if (!['1', '2', '3', '5', '6', '8', '9'].includes(firstDigit)) return false;

  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleanNif.charAt(i), 10) * (9 - i);
  }

  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit >= 10) checkDigit = 0;

  return checkDigit === parseInt(cleanNif.charAt(8), 10);
}

function validateClientNifFeedback(nif) {
  const feedbackEl = document.getElementById('clientNifFeedback');
  if (!feedbackEl) return;

  if (!nif) {
    feedbackEl.innerHTML = '';
    return;
  }

  if (isValidPortugueseNif(nif)) {
    feedbackEl.innerHTML = '<span class="text-xs text-emerald-600 font-medium"><i class="fa-solid fa-circle-check"></i> Válido</span>';
  } else {
    feedbackEl.innerHTML = '<span class="text-xs text-amber-600 font-medium"><i class="fa-solid fa-triangle-exclamation"></i> NIF Inválido</span>';
  }
}

// Manipulação de Itens
function addNewEmptyItem() {
  const newItem = {
    id: generateUUID(),
    description: "",
    details: "",
    unit: "unid",
    quantity: 1,
    price: 0.00,
    discountPercent: 0,
    vatRate: 23
  };
  state.currentQuote.items.push(newItem);
  renderItemsTable();
  recalculateTotals();
  updatePreview();
}

function addItemFromPreset(preset) {
  if (!preset) return;
  const newItem = {
    id: generateUUID(),
    description: preset.description,
    details: preset.details || "",
    unit: preset.unit || "unid",
    quantity: 1,
    price: preset.price || 0,
    discountPercent: 0,
    vatRate: preset.vatRate !== undefined ? preset.vatRate : 23
  };
  state.currentQuote.items.push(newItem);
  renderItemsTable();
  recalculateTotals();
  updatePreview();
}

function removeItem(id) {
  state.currentQuote.items = state.currentQuote.items.filter(item => item.id !== id);
  renderItemsTable();
  recalculateTotals();
  updatePreview();
}

function adjustItemQuantity(id, delta) {
  const item = state.currentQuote.items.find(i => i.id === id);
  if (!item) return;
  const newQty = Math.max(0.5, (item.quantity || 1) + delta);
  item.quantity = Math.round(newQty * 10) / 10;
  renderItemsTable();
  recalculateTotals();
  updatePreview();
}

function updateItemField(id, field, value) {
  const item = state.currentQuote.items.find(i => i.id === id);
  if (!item) return;

  if (['quantity', 'price', 'discountPercent', 'vatRate'].includes(field)) {
    item[field] = parseFloat(value) || 0;
  } else {
    item[field] = value;
  }

  recalculateTotals();
  updatePreview();
}

// Cálculos Financeiros com Regras Fiscais Portuguesas
function calculateQuoteFinancials() {
  const items = state.currentQuote.items;
  let subtotalBruto = 0;
  let totalDescontos = 0;
  let baseTributavel = 0;
  let totalIva = 0;
  const ivaPorTaxa = {};

  items.forEach(item => {
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const itemTotal = qty * price;
    const discount = (itemTotal * (item.discountPercent || 0)) / 100;
    const itemLiquido = Math.max(0, itemTotal - discount);

    subtotalBruto += itemTotal;
    totalDescontos += discount;
    baseTributavel += itemLiquido;

    if (state.currentQuote.vatExemption === 'none') {
      const taxRate = item.vatRate !== undefined ? item.vatRate : 23;
      const vatVal = (itemLiquido * taxRate) / 100;
      totalIva += vatVal;

      if (!ivaPorTaxa[taxRate]) ivaPorTaxa[taxRate] = { base: 0, valor: 0 };
      ivaPorTaxa[taxRate].base += itemLiquido;
      ivaPorTaxa[taxRate].valor += vatVal;
    }
  });

  const irsRate = state.currentQuote.irsRetentionRate || 0;
  const totalIrs = (baseTributavel * irsRate) / 100;

  const totalGeral = baseTributavel + totalIva;
  const totalAPagar = totalGeral - totalIrs;

  return {
    subtotalBruto,
    totalDescontos,
    baseTributavel,
    totalIva,
    ivaPorTaxa,
    irsRate,
    totalIrs,
    totalGeral,
    totalAPagar
  };
}

function recalculateTotals() {
  const totals = calculateQuoteFinancials();

  // Painel de Resumo
  document.getElementById('summarySubtotal').textContent = formatCurrency(totals.baseTributavel);
  document.getElementById('summaryIva').textContent = formatCurrency(totals.totalIva);
  document.getElementById('summaryTotal').textContent = formatCurrency(totals.totalGeral);

  // Barra de Ação Mobile Fixa
  const mobileBarTotal = document.getElementById('mobileBarTotal');
  if (mobileBarTotal) {
    mobileBarTotal.textContent = formatCurrency(totals.totalGeral);
  }

  const irsRow = document.getElementById('summaryIrsRow');
  if (totals.irsRate > 0) {
    irsRow.classList.remove('hidden');
    document.getElementById('summaryIrs').textContent = `-${formatCurrency(totals.totalIrs)} (${totals.irsRate}%)`;
    document.getElementById('summaryFinalPayable').textContent = formatCurrency(totals.totalAPagar);
  } else {
    irsRow.classList.add('hidden');
  }
}

// Renderização dos Itens (Mobile Cards + Desktop Table)
function renderItemsTable() {
  const tbody = document.getElementById('itemsTableBody');
  const mobileContainer = document.getElementById('itemsMobileCards');

  if (state.currentQuote.items.length === 0) {
    const emptyStateHtml = `
      <div class="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <i class="fa-solid fa-inbox text-2xl mb-1.5 block text-slate-300"></i>
        <div class="text-xs font-medium">Nenhum serviço adicionado</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Adicione um novo serviço ou use o catálogo rápido abaixo</div>
      </div>
    `;
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">Nenhum serviço adicionado.</td></tr>`;
    if (mobileContainer) mobileContainer.innerHTML = emptyStateHtml;
    return;
  }

  // 1. Renderização para Desktop (Tabela)
  if (tbody) {
    tbody.innerHTML = state.currentQuote.items.map((item, index) => {
      const itemTotalLiquido = Math.max(0, (item.quantity * item.price) * (1 - (item.discountPercent || 0)/100));
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition">
          <td class="p-2 text-center font-medium text-slate-400">${index + 1}</td>
          <td class="p-2">
            <input type="text" value="${escapeHtml(item.description)}" placeholder="Descrição do serviço"
              oninput="updateItemField('${item.id}', 'description', this.value)"
              class="w-full text-xs font-medium border border-slate-200 rounded px-2.5 py-1.5 focus:border-blue-600 outline-none" />
            <input type="text" value="${escapeHtml(item.details || '')}" placeholder="Detalhes adicionais (opcional)"
              oninput="updateItemField('${item.id}', 'details', this.value)"
              class="w-full text-[11px] text-slate-500 border-none bg-transparent px-1 mt-0.5 outline-none" />
          </td>
          <td class="p-2 w-20">
            <input type="number" step="0.5" min="0.01" value="${item.quantity}"
              oninput="updateItemField('${item.id}', 'quantity', this.value)"
              class="w-full text-xs text-center border border-slate-200 rounded px-2 py-1.5 focus:border-blue-600 outline-none" />
          </td>
          <td class="p-2 w-20">
            <select onchange="updateItemField('${item.id}', 'unit', this.value)"
              class="w-full text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-white outline-none">
              <option value="unid" ${item.unit === 'unid' ? 'selected' : ''}>unid</option>
              <option value="horas" ${item.unit === 'horas' ? 'selected' : ''}>horas</option>
              <option value="dias" ${item.unit === 'dias' ? 'selected' : ''}>dias</option>
              <option value="m²" ${item.unit === 'm²' ? 'selected' : ''}>m²</option>
              <option value="metro" ${item.unit === 'metro' ? 'selected' : ''}>metro</option>
              <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
              <option value="projeto" ${item.unit === 'projeto' ? 'selected' : ''}>projeto</option>
              <option value="sessão" ${item.unit === 'sessão' ? 'selected' : ''}>sessão</option>
              <option value="viagem" ${item.unit === 'viagem' ? 'selected' : ''}>viagem</option>
            </select>
          </td>
          <td class="p-2 w-24">
            <div class="relative">
              <input type="number" step="0.01" min="0" value="${item.price}"
                oninput="updateItemField('${item.id}', 'price', this.value)"
                class="w-full text-xs text-right pr-5 pl-2 border border-slate-200 rounded py-1.5 focus:border-blue-600 outline-none" />
              <span class="absolute right-1.5 top-1.5 text-[11px] text-slate-400">€</span>
            </div>
          </td>
          <td class="p-2 w-24 text-right font-medium text-slate-700 text-xs">
            ${formatCurrency(itemTotalLiquido)}
          </td>
          <td class="p-2 w-10 text-center">
            <button onclick="removeItem('${item.id}')" title="Remover item"
              class="text-slate-300 hover:text-red-500 transition p-1.5 rounded-full hover:bg-red-50">
              <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 2. Renderização Otimizada para Telemóvel (Cards com Steppers)
  if (mobileContainer) {
    mobileContainer.innerHTML = state.currentQuote.items.map((item, index) => {
      const itemTotalLiquido = Math.max(0, (item.quantity * item.price) * (1 - (item.discountPercent || 0)/100));
      return `
        <div class="bg-slate-50 border border-slate-200/90 rounded-xl p-3 shadow-2xs relative">
          
          <!-- Cabeçalho do Card -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center">
                ${index + 1}
              </span>
              <span class="text-xs font-semibold text-slate-700">Serviço</span>
            </div>
            <button onclick="removeItem('${item.id}')" title="Remover item"
              class="touch-btn text-rose-500 hover:text-rose-700 px-2 py-1 text-xs rounded-lg active:bg-rose-50 transition">
              <i class="fa-solid fa-trash-can mr-1"></i> Remover
            </button>
          </div>

          <!-- Campos de Descrição -->
          <div class="space-y-1.5 mb-2.5">
            <input type="text" value="${escapeHtml(item.description)}" placeholder="Descrição do serviço"
              oninput="updateItemField('${item.id}', 'description', this.value)"
              class="w-full text-sm font-semibold border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" value="${escapeHtml(item.details || '')}" placeholder="Detalhes complementares (opcional)"
              oninput="updateItemField('${item.id}', 'details', this.value)"
              class="w-full text-xs text-slate-600 border border-slate-200/60 rounded-lg px-2.5 py-1.5 bg-white/70 outline-none" />
          </div>

          <!-- Linha de Controlo: Quantidade com Stepper Touch, Unidade e Preço -->
          <div class="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-100">
            
            <!-- Stepper Touch de Quantidade (Colunas 6) -->
            <div class="col-span-6">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Quantidade</label>
              <div class="flex items-center">
                <button type="button" onclick="adjustItemQuantity('${item.id}', -1)"
                  class="touch-btn w-8 h-8 rounded-l-lg bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 active:bg-slate-200">
                  <i class="fa-solid fa-minus text-xs"></i>
                </button>
                <input type="number" step="0.5" min="0.01" value="${item.quantity}"
                  oninput="updateItemField('${item.id}', 'quantity', this.value)"
                  class="w-12 h-8 text-center text-sm font-bold border-y border-slate-200 outline-none" />
                <button type="button" onclick="adjustItemQuantity('${item.id}', 1)"
                  class="touch-btn w-8 h-8 rounded-r-lg bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 active:bg-slate-200">
                  <i class="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Unidade (Colunas 3) -->
            <div class="col-span-3">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Unid.</label>
              <select onchange="updateItemField('${item.id}', 'unit', this.value)"
                class="w-full h-8 text-xs font-medium border border-slate-200 rounded-lg px-1 bg-slate-50 outline-none">
                <option value="unid" ${item.unit === 'unid' ? 'selected' : ''}>unid</option>
                <option value="horas" ${item.unit === 'horas' ? 'selected' : ''}>horas</option>
                <option value="dias" ${item.unit === 'dias' ? 'selected' : ''}>dias</option>
                <option value="m²" ${item.unit === 'm²' ? 'selected' : ''}>m²</option>
                <option value="metro" ${item.unit === 'metro' ? 'selected' : ''}>metro</option>
                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                <option value="projeto" ${item.unit === 'projeto' ? 'selected' : ''}>proj.</option>
                <option value="sessão" ${item.unit === 'sessão' ? 'selected' : ''}>sessão</option>
                <option value="viagem" ${item.unit === 'viagem' ? 'selected' : ''}>viagem</option>
              </select>
            </div>

            <!-- Preço Unitário (Colunas 3) -->
            <div class="col-span-3">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Preço (€)</label>
              <input type="number" step="0.5" min="0" value="${item.price}"
                oninput="updateItemField('${item.id}', 'price', this.value)"
                class="w-full h-8 text-xs font-bold text-right border border-slate-200 rounded-lg px-1.5 focus:border-blue-600 outline-none" />
            </div>

          </div>

          <!-- Total do Item no Card -->
          <div class="flex justify-between items-center mt-2 px-1 text-xs">
            <span class="text-slate-400">Total do Item:</span>
            <span class="font-bold text-blue-900 font-mono text-sm">${formatCurrency(itemTotalLiquido)}</span>
          </div>

        </div>
      `;
    }).join('');
  }
}

// Atualização da Folha de Pré-visualização (A4 Oficial)
function updatePreview() {
  const quote = state.currentQuote;
  const profile = state.profile;
  const totals = calculateQuoteFinancials();

  // Cabeçalho da Empresa / Emitente
  document.getElementById('prevProfileName').textContent = profile.name || "João Santos";
  document.getElementById('prevProfileNif').textContent = profile.nif || "269413448";

  const impicEl = document.getElementById('prevProfileImpic');
  const impicBadge = document.getElementById('prevImpicBadge');
  if (profile.impic) {
    if (impicEl) impicEl.textContent = profile.impic;
    if (impicBadge) impicBadge.classList.remove('hidden');
  } else {
    if (impicBadge) impicBadge.classList.add('hidden');
  }

  document.getElementById('prevProfileType').textContent = profile.businessType || "Empresário em Nome Individual";
  document.getElementById('prevProfileContact').innerHTML = `
    ${profile.phone ? `<div><i class="fa-solid fa-phone mr-1.5 text-blue-600"></i> ${escapeHtml(profile.phone)}</div>` : ''}
    ${profile.email ? `<div><i class="fa-solid fa-envelope mr-1.5 text-blue-600"></i> ${escapeHtml(profile.email)}</div>` : ''}
    ${profile.address ? `<div><i class="fa-solid fa-location-dot mr-1.5 text-blue-600"></i> ${escapeHtml(profile.address)}</div>` : ''}
  `;

  // Logotipo
  const logoEl = document.getElementById('prevLogo');
  if (profile.logoUrl) {
    logoEl.src = profile.logoUrl;
    logoEl.classList.remove('hidden');
  } else {
    logoEl.classList.add('hidden');
  }

  // Metadados do Orçamento
  document.getElementById('prevQuoteNumber').textContent = quote.number || "ORC-000";
  document.getElementById('prevIssueDate').textContent = formatDatePt(quote.issueDate);
  document.getElementById('prevValidDate').textContent = formatDatePt(quote.validUntilDate);

  // Dados do Cliente
  document.getElementById('prevClientName').textContent = quote.client.name || "A/C Exmo.(a) Cliente";
  document.getElementById('prevClientNif').textContent = quote.client.nif ? `NIF: ${quote.client.nif}` : "NIF: Consumidor Final";
  document.getElementById('prevClientAddress').textContent = quote.client.address || "";
  document.getElementById('prevClientPhone').textContent = quote.client.phone ? `Tel: ${quote.client.phone}` : "";
  document.getElementById('prevClientEmail').textContent = quote.client.email ? `Email: ${quote.client.email}` : "";

  // Tabela de Itens no Documento
  const prevItemsTbody = document.getElementById('prevItemsTableBody');
  if (quote.items.length === 0) {
    prevItemsTbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 italic text-xs">Sem itens discriminados</td></tr>`;
  } else {
    prevItemsTbody.innerHTML = quote.items.map((item, index) => {
      const itemSubtotal = Math.max(0, (item.quantity * item.price) * (1 - (item.discountPercent || 0)/100));
      return `
        <tr class="border-b border-slate-100">
          <td class="py-2 px-2 text-slate-400 text-center font-mono text-xs">${index + 1}</td>
          <td class="py-2 px-2">
            <div class="font-semibold text-slate-800 text-xs sm:text-sm">${escapeHtml(item.description || 'Item sem descrição')}</div>
            ${item.details ? `<div class="text-[11px] text-slate-500 mt-0.5 leading-snug">${escapeHtml(item.details)}</div>` : ''}
          </td>
          <td class="py-2 px-2 text-center text-slate-700 text-xs font-medium">
            ${item.quantity} <span class="text-[10px] text-slate-400">${item.unit}</span>
          </td>
          <td class="py-2 px-2 text-right text-slate-700 text-xs font-medium">
            ${formatCurrency(item.price)}
          </td>
          <td class="py-2 px-2 text-right text-slate-900 font-semibold text-xs sm:text-sm">
            ${formatCurrency(itemSubtotal)}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Linhas de Totais no Documento
  document.getElementById('prevSubtotalBase').textContent = formatCurrency(totals.baseTributavel);

  // Menção de Isenção ou Detalhe do IVA
  const vatRow = document.getElementById('prevVatRow');
  const vatNotice = document.getElementById('prevVatNotice');
  if (quote.vatExemption !== 'none') {
    const exemptionObj = VAT_EXEMPTIONS.find(v => v.value === quote.vatExemption);
    vatRow.classList.add('hidden');
    vatNotice.classList.remove('hidden');
    vatNotice.textContent = exemptionObj ? exemptionObj.label : "Regime de Isenção de IVA";
  } else {
    vatRow.classList.remove('hidden');
    vatNotice.classList.add('hidden');
    document.getElementById('prevVatAmount').textContent = formatCurrency(totals.totalIva);
  }

  // Linha de Retenção de IRS
  const irsRowPrev = document.getElementById('prevIrsRow');
  if (totals.irsRate > 0) {
    irsRowPrev.classList.remove('hidden');
    document.getElementById('prevIrsRateLabel').textContent = `Retenção IRS (${totals.irsRate}%)`;
    document.getElementById('prevIrsAmount').textContent = `-${formatCurrency(totals.totalIrs)}`;
    document.getElementById('prevGrandTotalLabel').textContent = "Total Líquido a Pagar";
    document.getElementById('prevGrandTotal').textContent = formatCurrency(totals.totalAPagar);
  } else {
    irsRowPrev.classList.add('hidden');
    document.getElementById('prevGrandTotalLabel').textContent = "Total Geral";
    document.getElementById('prevGrandTotal').textContent = formatCurrency(totals.totalGeral);
  }

  // Dados Bancários para Pagamento
  document.getElementById('prevIban').textContent = profile.iban || "A definir";
  document.getElementById('prevBankName').textContent = profile.bankName ? `(${profile.bankName})` : "";

  // Condições e Observações
  document.getElementById('prevPaymentTerms').textContent = quote.paymentTerms || "A combinar com o cliente.";
  document.getElementById('prevNotes').textContent = quote.notes || "Obrigado pela sua preferência!";
}

// Render Geral
function renderAll() {
  document.getElementById('quoteNumber').value = state.currentQuote.number;
  document.getElementById('issueDate').value = state.currentQuote.issueDate;
  document.getElementById('validUntilDate').value = state.currentQuote.validUntilDate;

  document.getElementById('clientName').value = state.currentQuote.client.name;
  document.getElementById('clientNif').value = state.currentQuote.client.nif;
  document.getElementById('clientEmail').value = state.currentQuote.client.email;
  document.getElementById('clientPhone').value = state.currentQuote.client.phone;
  document.getElementById('clientAddress').value = state.currentQuote.client.address;

  document.getElementById('vatExemptionSelect').value = state.currentQuote.vatExemption;
  document.getElementById('irsRetentionSelect').value = state.currentQuote.irsRetentionRate;
  document.getElementById('paymentTermsInput').value = state.currentQuote.paymentTerms;
  document.getElementById('notesInput').value = state.currentQuote.notes;

  renderCatalogPresetsList();
  renderItemsTable();
  recalculateTotals();
  updatePreview();
}

// Catálogo Rápido na Barra Inferior
function renderCatalogPresetsList() {
  const container = document.getElementById('catalogQuickAdd');
  if (!container) return;

  container.innerHTML = state.catalog.map(cat => `
    <div class="mb-3">
      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <i class="fa-solid ${cat.icon || 'fa-tag'} text-blue-600"></i> ${escapeHtml(cat.category)}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
        ${cat.items.map(item => `
          <div onclick="addPresetItemById('${item.id}')"
            class="touch-btn cursor-pointer bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 active:border-blue-400 rounded-lg p-2.5 transition flex justify-between items-center group">
            <div class="truncate pr-2 text-left">
              <div class="text-xs font-semibold text-slate-800 group-hover:text-blue-900 truncate">${escapeHtml(item.description)}</div>
              <div class="text-[11px] text-slate-500">${formatCurrency(item.price)} / ${item.unit}</div>
            </div>
            <button type="button" class="bg-white group-hover:bg-blue-600 text-slate-500 group-hover:text-white rounded-md p-1.5 transition text-xs shadow-xs flex-shrink-0">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function addPresetItemById(id) {
  for (const cat of state.catalog) {
    const found = cat.items.find(i => i.id === id);
    if (found) {
      addItemFromPreset(found);
      showNotification(`"${found.description}" adicionado!`, 'success');
      return;
    }
  }
}

// Ações do Orçamento
function saveQuoteToHistory() {
  try {
    const quoteToSave = JSON.parse(JSON.stringify(state.currentQuote));
    const totals = calculateQuoteFinancials();
    quoteToSave.totalValue = totals.totalGeral;
    quoteToSave.savedAt = new Date().toISOString();

    const existingIndex = state.savedQuotes.findIndex(q => q.id === quoteToSave.id || q.number === quoteToSave.number);
    if (existingIndex >= 0) {
      state.savedQuotes[existingIndex] = quoteToSave;
    } else {
      state.savedQuotes.unshift(quoteToSave);
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(state.savedQuotes));
    updateSequenceAfterSave(quoteToSave.number);
    showNotification(`Orçamento ${quoteToSave.number} guardado!`, 'success');
  } catch (err) {
    console.error("Erro ao guardar histórico:", err);
    showNotification("Erro ao guardar orçamento.", "error");
  }
}

function createNewQuote() {
  if (confirm("Deseja iniciar um novo orçamento?")) {
    state.currentQuote = {
      id: generateUUID(),
      number: getNextSequentialQuoteNumber(),
      issueDate: new Date().toISOString().split('T')[0],
      validUntilDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      client: { name: "", nif: "", email: "", phone: "", address: "" },
      items: [],
      discountGlobal: 0,
      vatExemption: state.profile.defaultVatExemption || "none",
      irsRetentionRate: state.profile.defaultIrsRetention || 0,
      paymentTerms: state.profile.defaultPaymentTerms || "",
      notes: state.profile.notes || ""
    };
    renderAll();
    showNotification(`Novo orçamento ${state.currentQuote.number} iniciado!`, "info");
  }
}

// Exportação / Impressão em PDF
function printQuote() {
  // Se estiver em mobile e na aba de edição, muda temporariamente para o preview antes de imprimir
  if (window.innerWidth < 1024) {
    switchMobileView('preview');
  }
  setTimeout(() => {
    window.print();
  }, 100);
}

// Enviar Resumo por WhatsApp
function shareViaWhatsApp() {
  const quote = state.currentQuote;
  const totals = calculateQuoteFinancials();
  const clientName = quote.client.name ? quote.client.name.trim() : "Exmo.(a) Cliente";
  const clientPhone = quote.client.phone ? quote.client.phone.replace(/[^0-9]/g, '') : "";

  let itemsSummary = quote.items.map((it, idx) => `  ${idx + 1}. ${it.description} (${it.quantity} ${it.unit}) - ${formatCurrency(it.price * it.quantity)}`).join('\n');

  let text = `Olá ${clientName},\n\n`;
  text += `Segue o resumo da proposta de orçamento *${quote.number}* de *João Santos* (NIF: 269413448):\n\n`;
  text += `*Serviços Orçamentados:*\n${itemsSummary}\n\n`;
  text += `*Base Tributável:* ${formatCurrency(totals.baseTributavel)}\n`;
  if (totals.totalIva > 0) {
    text += `*IVA:* ${formatCurrency(totals.totalIva)}\n`;
  } else if (quote.vatExemption !== 'none') {
    text += `*IVA:* Isento (${VAT_EXEMPTIONS.find(v=>v.value===quote.vatExemption)?.label || 'Isenção'})\n`;
  }
  text += `*VALOR TOTAL:* ${formatCurrency(totals.totalGeral)}\n\n`;
  text += `*Validade:* Até ${formatDatePt(quote.validUntilDate)}\n`;
  text += `*Condições de Pagamento:* ${quote.paymentTerms}\n\n`;
  text += `Estamos à disposição para qualquer esclarecimento ou agendamento dos trabalhos!`;

  const encodedText = encodeURIComponent(text);
  const waUrl = clientPhone ? `https://wa.me/${clientPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;

  window.open(waUrl, '_blank');
}

// Modal do Perfil do Prestador (João Santos)
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  const prof = state.profile;

  document.getElementById('profName').value = prof.name;
  document.getElementById('profNif').value = prof.nif;
  document.getElementById('profImpic').value = prof.impic || "";
  document.getElementById('profBusinessType').value = prof.businessType;
  document.getElementById('profPhone').value = prof.phone;
  document.getElementById('profEmail').value = prof.email;
  document.getElementById('profAddress').value = prof.address;
  document.getElementById('profIban').value = prof.iban;
  document.getElementById('profBankName').value = prof.bankName;
  document.getElementById('profLogoUrl').value = prof.logoUrl || "";

  // Numeração Sequencial
  const nextNum = getNextSequentialQuoteNumber();
  const nextSeqMatch = nextNum.match(/\/(\d+)$/);
  document.getElementById('profSeriesPrefix').value = prof.seriesPrefix || "ORC";
  document.getElementById('profNextSeq').value = nextSeqMatch ? parseInt(nextSeqMatch[1], 10) : 1;

  modal.classList.remove('hidden');
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.add('hidden');
}

function saveProfileSettings() {
  state.profile.name = document.getElementById('profName').value.trim();
  state.profile.nif = document.getElementById('profNif').value.trim();
  state.profile.impic = document.getElementById('profImpic').value.trim();
  state.profile.businessType = document.getElementById('profBusinessType').value.trim();
  state.profile.phone = document.getElementById('profPhone').value.trim();
  state.profile.email = document.getElementById('profEmail').value.trim();
  state.profile.address = document.getElementById('profAddress').value.trim();
  state.profile.iban = document.getElementById('profIban').value.trim();
  state.profile.bankName = document.getElementById('profBankName').value.trim();
  state.profile.logoUrl = document.getElementById('profLogoUrl').value.trim();

  // Guardar Prefixo da Série e Próximo Número Sequencial
  const prefix = (document.getElementById('profSeriesPrefix').value.trim().toUpperCase()) || "ORC";
  state.profile.seriesPrefix = prefix;

  const nextSeqInput = parseInt(document.getElementById('profNextSeq').value, 10);
  if (!isNaN(nextSeqInput) && nextSeqInput >= 1) {
    const currentYear = new Date().getFullYear();
    localStorage.setItem(`${STORAGE_KEYS.SEQUENCE}_${currentYear}`, String(nextSeqInput));
  }

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
  closeProfileModal();
  updatePreview();
  showNotification("Dados atualizados com sucesso!", "success");
}

// Modal de Histórico de Orçamentos
function openHistoryModal() {
  const modal = document.getElementById('historyModal');
  const tbody = document.getElementById('historyTableBody');
  const mobileContainer = document.getElementById('historyCardsMobile');

  if (state.savedQuotes.length === 0) {
    const emptyHtml = `<div class="text-center py-6 text-slate-400 text-xs">Ainda não existem orçamentos guardados.</div>`;
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">Ainda não existem orçamentos guardados.</td></tr>`;
    if (mobileContainer) mobileContainer.innerHTML = emptyHtml;
  } else {
    // Tabela Desktop
    if (tbody) {
      tbody.innerHTML = state.savedQuotes.map(q => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
          <td class="p-3 font-semibold text-blue-700">${escapeHtml(q.number)}</td>
          <td class="p-3">${escapeHtml(q.client?.name || 'Cliente')}</td>
          <td class="p-3 text-xs text-slate-500">${formatDatePt(q.issueDate)}</td>
          <td class="p-3 font-bold text-slate-800">${formatCurrency(q.totalValue || 0)}</td>
          <td class="p-3 text-right space-x-1.5">
            <button onclick="loadQuoteFromHistory('${q.id}')" title="Carregar Orçamento"
              class="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded transition font-medium">
              <i class="fa-solid fa-folder-open mr-1"></i> Abrir
            </button>
            <button onclick="deleteQuoteFromHistory('${q.id}')" title="Eliminar"
              class="px-2 py-1 text-xs bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded transition">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Cards Mobile
    if (mobileContainer) {
      mobileContainer.innerHTML = state.savedQuotes.map(q => `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
          <div>
            <div class="font-bold text-blue-900 text-xs">${escapeHtml(q.number)}</div>
            <div class="text-xs text-slate-700 font-medium truncate max-w-[150px]">${escapeHtml(q.client?.name || 'Cliente')}</div>
            <div class="text-[11px] text-slate-400">${formatDatePt(q.issueDate)} • <span class="font-bold text-slate-800">${formatCurrency(q.totalValue || 0)}</span></div>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="loadQuoteFromHistory('${q.id}')"
              class="touch-btn px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
              Abrir
            </button>
            <button onclick="deleteQuoteFromHistory('${q.id}')"
              class="touch-btn p-1.5 text-rose-500 rounded-lg">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  modal.classList.remove('hidden');
}

function closeHistoryModal() {
  document.getElementById('historyModal').classList.add('hidden');
}

function loadQuoteFromHistory(id) {
  const found = state.savedQuotes.find(q => q.id === id);
  if (found) {
    state.currentQuote = JSON.parse(JSON.stringify(found));
    renderAll();
    closeHistoryModal();
    showNotification(`Orçamento ${found.number} carregado!`, "info");
  }
}

function deleteQuoteFromHistory(id) {
  if (confirm("Deseja remover este orçamento do histórico?")) {
    state.savedQuotes = state.savedQuotes.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_QUOTES, JSON.stringify(state.savedQuotes));
    openHistoryModal();
    showNotification("Orçamento removido.", "info");
  }
}

// Notificações Toast
function showNotification(message, type = 'info') {
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600' : (type === 'error' ? 'bg-rose-600' : 'bg-slate-800');
  toast.className = `fixed top-20 sm:top-auto sm:bottom-6 right-3 left-3 sm:left-auto z-50 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-3 opacity-0 ${bg}`;

  const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Utilitários de Formatação
function formatCurrency(val) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val || 0);
}

function formatDatePt(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
