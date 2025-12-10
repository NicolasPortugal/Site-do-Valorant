import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
// Cole aqui os dados que você pegou no Passo 3
const firebaseConfig = {
  apiKey: "AIzaSyAqYc6bqgKCPJTqlftN9dv7PXq2r530fEc",
  authDomain: "site-comms.firebaseapp.com",
  projectId: "site-comms",
  storageBucket: "site-comms.firebasestorage.app",
  messagingSenderId: "117765199744",
  appId: "1:117765199744:web:b2aecb64386440ba3f1365"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Seleção de Elementos (MOVIDO PARA O TOPO) ---
    // Precisamos selecionar os elementos ANTES de usar no sistema de idiomas
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    const cards = document.querySelectorAll('.agent-card');
    const sections = document.querySelectorAll('.class-section');
    const universalBox = document.querySelector('.universal-box');

    // Elementos do Modal
    const modal = document.getElementById('agentModal');
    const closeModal = document.querySelector('.close-modal');
    const modalContent = document.querySelector('.modal-content');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalClass = document.getElementById('modalClass'); 
    const modalContextBox = document.getElementById('modalContextBox');
    const modalReasonText = document.getElementById('modalReasonText');
    const modalAbilitiesGrid = document.getElementById('modalAbilitiesGrid');

    // Elementos do Chat e Botões Flutuantes
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const scrollToChatBtn = document.getElementById('scrollToChatBtn');
    const commsSection = document.querySelector('.comms-section');
    const commsForm = document.getElementById('commsForm');
    const commsInput = document.getElementById('commsInput');
    const commsNameInput = document.getElementById('commsName');
    const commsFeed = document.getElementById('commsFeed');

    // --- 0. Sistema de Idiomas (Atualizado para Toggle Único) ---
    const langToggle = document.getElementById('langToggle');
    const body = document.body;
    
    const translations = {
        pt: {
            searchPlaceholder: "Buscar agente...",
            modalAnalysis: "📝 Análise & Contexto",
            modalAbilities: "Alterações de Habilidades",
            systemWelcome: "Bem-vindo ao canal de feedback. Mantenha a comunicação limpa."
        },
        en: {
            searchPlaceholder: "Search agent...",
            modalAnalysis: "📝 Analysis & Context",
            modalAbilities: "Ability Changes",
            systemWelcome: "Welcome to the feedback channel. Keep comms clean."
        }
    };

    function setLanguage(lang) {
        // 1. Atualiza classes do Body (o CSS faz a animação do slider baseado nisso)
        body.classList.remove('lang-pt', 'lang-en');
        body.classList.add(`lang-${lang}`);

        // 2. Atualiza Placeholders e Textos JS
        const t = translations[lang];
        if(searchInput) searchInput.placeholder = t.searchPlaceholder;
        
        const modalContextTitle = document.querySelector('#modalContextBox h3');
        if(modalContextTitle) modalContextTitle.innerHTML = `<span style="font-size:1.5em">📝</span> ${lang === 'pt' ? 'Análise & Contexto' : 'Analysis & Context'}`;
        
        const modalAbilitiesTitle = document.querySelector('.modal-body > h3'); 
        if(modalAbilitiesTitle) modalAbilitiesTitle.textContent = t.modalAbilities;

        // Salva na memória
        localStorage.setItem('valorant_patch_lang', lang);
    }

    // Event Listener do Toggle Único
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            // Verifica qual é o idioma atual no body e inverte
            const currentLang = body.classList.contains('lang-en') ? 'en' : 'pt';
            const newLang = currentLang === 'pt' ? 'en' : 'pt';
            
            setLanguage(newLang);
        });
        
        // Adiciona suporte a tecla Enter/Espaço para acessibilidade
        langToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                langToggle.click();
            }
        });
    }

    // Inicializar idioma
    const savedLang = localStorage.getItem('valorant_patch_lang') || 'pt';
    setLanguage(savedLang);


    // --- 2. Cores e Temas dos Agentes ---
    const agentColors = {
        // Duelistas
        'phoenix':   { glow: 'rgba(255, 69, 0, 0.4)', p1: '#ffce00', p2: '#ff5e00', p3: '#ff8c00' },
        'jett':      { glow: 'rgba(148, 225, 240, 0.4)', p1: '#ffffff', p2: '#a4e8f0', p3: '#6ad2e0' },
        'reyna':     { glow: 'rgba(183, 39, 219, 0.4)', p1: '#e58bf5', p2: '#b727db', p3: '#6a1b9a' },
        'raze':      { glow: 'rgba(255, 110, 30, 0.4)', p1: '#ffae00', p2: '#ff5500', p3: '#a83200' },
        'yoru':      { glow: 'rgba(51, 80, 219, 0.4)', p1: '#5c8aff', p2: '#3350db', p3: '#1a2e85' },
        'neon':      { glow: 'rgba(255, 238, 0, 0.4)', p1: '#ffffaa', p2: '#ffee00', p3: '#1144ff' },
        'iso':       { glow: 'rgba(164, 137, 235, 0.4)', p1: '#e0d4fc', p2: '#a489eb', p3: '#5f4b8b' },

        // Controladores
        'brimstone': { glow: 'rgba(255, 69, 0, 0.4)', p1: '#ffce00', p2: '#ff5e00', p3: '#ff8c00' },
        'viper':     { glow: 'rgba(23, 229, 136, 0.3)', p1: '#aaffaa', p2: '#17e588', p3: '#0d6b42' },
        'omen':      { glow: 'rgba(56, 59, 107, 0.5)', p1: '#8890ff', p2: '#4a4e8f', p3: '#1f2140' },
        'astra':     { glow: 'rgba(219, 90, 210, 0.4)', p1: '#f8c9f5', p2: '#bd4aba', p3: '#4a156e' },
        'harbor':    { glow: 'rgba(20, 160, 170, 0.4)', p1: '#a6f0f5', p2: '#14a0aa', p3: '#084f54' },
        'clove':     { glow: 'rgba(240, 120, 180, 0.4)', p1: '#ffcce6', p2: '#f078b4', p3: '#9e2e63' },

        // Iniciadores
        'sova':      { glow: 'rgba(88, 160, 240, 0.4)', p1: '#cce6ff', p2: '#58a0f0', p3: '#1c4a78' },
        'breach':    { glow: 'rgba(217, 134, 61, 0.4)', p1: '#ffddaa', p2: '#d9863d', p3: '#8c501e' },
        'skye':      { glow: 'rgba(150, 200, 100, 0.4)', p1: '#eaffcc', p2: '#aacc66', p3: '#557722' },
        'kayo':      { glow: 'rgba(50, 200, 255, 0.4)', p1: '#ccf0ff', p2: '#00ccff', p3: '#005588' },
        'fade':      { glow: 'rgba(40, 40, 40, 0.6)', p1: '#888888', p2: '#444444', p3: '#000000' },
        'gekko':     { glow: 'rgba(190, 230, 80, 0.4)', p1: '#eeffaa', p2: '#bee650', p3: '#6a8c1f' },
        'tejo':      { glow: 'rgba(100, 100, 100, 0.4)', p1: '#ffffff', p2: '#aaaaaa', p3: '#555555' },

        // Sentinelas
        'sage':      { glow: 'rgba(64, 224, 208, 0.3)', p1: '#ccfff9', p2: '#40e0d0', p3: '#1a756b' },
        'cypher':    { glow: 'rgba(200, 200, 200, 0.3)', p1: '#ffffff', p2: '#aaaaaa', p3: '#555555' },
        'killjoy':   { glow: 'rgba(255, 215, 0, 0.3)', p1: '#ffffcc', p2: '#ffd700', p3: '#b29600' },
        'chamber':   { glow: 'rgba(219, 180, 80, 0.4)', p1: '#ffecaa', p2: '#dbb450', p3: '#8c6e23' },
        'deadlock':  { glow: 'rgba(150, 180, 200, 0.4)', p1: '#e0f0ff', p2: '#96b4c8', p3: '#4a6a7d' },
        'vyse':      { glow: 'rgba(150, 150, 150, 0.4)', p1: '#dcdcdc', p2: '#808080', p3: '#2f2f2f' },
        'veto':      { glow: 'rgba(150, 150, 150, 0.4)', p1: '#dcdcdc', p2: '#808080', p3: '#2f2f2f' }, 

        // Padrão
        'default':   { glow: 'rgba(255, 255, 255, 0.1)', p1: '#ffffff', p2: '#888888', p3: '#333333' }
    };

    // 1. Dados dos Agentes (Simulação de API)
    // Você pode editar esses números manualmente conforme os patches mudam
    const agentStatsData = {
        'iso': 52.4,
        'clove': 51.8,
        'raze': 51.2,
        'cypher': 50.9,
        'jett': 50.5,
        'reyna': 50.1,
        'phoenix': 49.8,
        'sova': 49.5,
        'killjoy': 49.2,
        'brimstone': 48.9,
        'omen': 48.7,
        'gekko': 48.5,
        'sage': 48.2,
        'neon': 47.9,
        'fade': 47.8,
        'breach': 47.5,
        'skye': 47.2,
        'viper': 46.8,
        'astra': 46.5,
        'yoru': 46.2,
        'kayo': 45.8,
        'chamber': 45.5,
        'deadlock': 45.2,
        'harbor': 44.9,
        'vyse': 48.0,
        'tejo': 49.0,
        'veto': 47.0
    };

    // Função Auxiliar para definir cor baseada na %
    function getRateClass(rate) {
        if (rate >= 50.5) return 'rate-high'; // Verde
        if (rate >= 48.0) return 'rate-mid';  // Amarelo
        return 'rate-low';                    // Vermelho
    }

    // 2. Injetar Win Rate Individual nos Cards
    // 2. Injetar Win Rate e Reestruturar o Header
    function renderIndividualWinRates() {
        cards.forEach(card => {
            const agentNameKey = card.getAttribute('data-name').toLowerCase();
            const winRate = agentStatsData[agentNameKey] || 'N/A';
            
            // Elementos atuais (que vamos substituir/reorganizar)
            // Pegamos o elemento H3 original
            const originalNameEl = card.querySelector('.agent-name'); 
            
            if (!originalNameEl) return;

            // Extraimos apenas o TEXTO do nome (ignorando o span da classe antiga)
            // childNodes[0] geralmente é o texto "Phoenix " antes do span
            let rawName = originalNameEl.childNodes[0].textContent.trim();
            
            // Pegamos a classe do atributo do card para garantir (mais seguro que pegar do span)
            const roleName = card.getAttribute('data-class'); 
            
            // Definimos a cor
            let colorClass = '';
            if (typeof winRate === 'number') {
                colorClass = getRateClass(winRate);
            }

            // CRIAMOS O NOVO HTML ESTRUTURADO
            // Note que mantivemos a classe 'agent-name' no h3 para sua busca continuar funcionando
            const newHeaderHTML = `
                <div class="agent-header-wrapper">
                    <div class="agent-info-col">
                        <span class="agent-class-badge">${roleName}</span>
                        <h3 class="agent-name agent-name-styled">${rawName}</h3>
                    </div>
                    
                    <div class="agent-wr-col">
                        <span class="wr-label">WIN RATE</span>
                        <span class="wr-value ${colorClass}">${winRate}%</span>
                    </div>
                </div>
            `;

            // Substituimos o H3 antigo pelo nosso novo bloco completo
            // O outerHTML troca o próprio elemento selecionado pelo novo
            // Mas precisamos inserir isso no lugar certo.
            
            // A melhor forma é substituir o H3 antigo.
            // Mas cuidado: o seu CSS antigo de '.agent-name' pode ter estilos conflitantes.
            // Por isso adicionei a classe 'agent-name-styled' no CSS acima para resetar estilos.
            
            // Vamos inserir o novo header ANTES dos grupos de habilidade
            const cardBody = card.querySelector('.card-body');
            
            // Removemos o header antigo (o h3 bagunçado)
            originalNameEl.remove();
            
            // Inserimos o novo header no topo do body
            cardBody.insertAdjacentHTML('afterbegin', newHeaderHTML);
        });
    }

    // 3. Renderizar o Painel "Top 5" Global
    // --- ATUALIZADO: SISTEMA DE META ANALYTICS (HUD GLOBAL) ---
    
    // Variáveis de Estado
    let currentMetaFilter = 'all';
    let currentMetaSort = 'desc';
    let globalAgentList = []; // Vai guardar a lista combinada de dados + classes

    // Função para montar a lista de dados completa
    function buildGlobalAgentData() {
        globalAgentList = [];
        
        // 1. Percorre todos os cards do HTML para pegar Nome, Classe e Imagem
        // Isso garante que temos os dados corretos que já existem na página
        cards.forEach(card => {
            const nameKey = card.getAttribute('data-name').toLowerCase(); // ex: 'iso'
            const agentClass = card.getAttribute('data-class'); // ex: 'duelist'
            const displayImg = card.querySelector('.agent-img-box img').src;
            const displayName = card.querySelector('.agent-name').childNodes[0].textContent.trim();
            
            // 2. Pega a Win Rate do objeto de dados manual
            const winRate = agentStatsData[nameKey] || 0;

            if (agentStatsData[nameKey]) { // Só adiciona se tiver dados estatísticos
                globalAgentList.push({
                    key: nameKey,
                    name: displayName,
                    role: agentClass,
                    img: displayImg,
                    rate: winRate
                });
            }
        });
    }

    function renderGlobalStats() {
        const metaSection = document.getElementById('metaAnalytics');
        const metaTrack = document.getElementById('metaTopGrid');
        
        if (!metaSection || !metaTrack) return;

        // 1. Filtragem
        let filtered = globalAgentList.filter(agent => {
            if (currentMetaFilter === 'all') return true;
            return agent.role === currentMetaFilter;
        });

        // 2. Ordenação
        filtered.sort((a, b) => {
            if (currentMetaSort === 'desc') return b.rate - a.rate; // Maior -> Menor
            if (currentMetaSort === 'asc') return a.rate - b.rate;  // Menor -> Maior
            if (currentMetaSort === 'az') return a.name.localeCompare(b.name); // A-Z
            return 0;
        });

        // 3. Renderização HTML
        metaTrack.innerHTML = ''; // Limpa

        if (filtered.length === 0) {
            metaTrack.innerHTML = '<div style="padding:10px; color:#666;">Nenhum agente encontrado neste filtro.</div>';
            return;
        }

        filtered.forEach(agent => {
            const colorClass = getRateClass(agent.rate);
            
            const html = `
                <div class="meta-mini-card ${colorClass}" title="${agent.name} - ${agent.rate}%">
                    <img src="${agent.img}" class="meta-mini-img" alt="${agent.name}">
                    <div class="meta-mini-info">
                        <span class="meta-mini-class">${agent.role}</span>
                        <span class="meta-mini-name">${agent.name}</span>
                        <span class="meta-mini-rate ${colorClass}">${agent.rate}%</span>
                    </div>
                </div>
            `;
            metaTrack.innerHTML += html;
        });

        // Mostra a seção
        metaSection.style.display = 'block';
    }


    // --- NOVO CÓDIGO: Event Listeners do HUD Global ---

    // 1. Selecionar os elementos
    const metaFilterBtns = document.querySelectorAll('.meta-filter-btn');
    const metaSortSelect = document.getElementById('metaSortSelect');

    // 2. Lógica de Clique nos Filtros (Classes)
    metaFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove a classe 'active' de todos e adiciona no clicado
            metaFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Atualiza a variável de filtro e redesenha
            currentMetaFilter = btn.getAttribute('data-meta-filter');
            renderGlobalStats();
        });
    });

    // 3. Lógica de Mudança na Ordenação (Select)
    if (metaSortSelect) {
        metaSortSelect.addEventListener('change', (e) => {
            currentMetaSort = e.target.value;
            renderGlobalStats();
        });
    }
    // --- Event Listeners do HUD ---

    // 1. Botões de Filtro
    // --- LÓGICA DAS SETAS DO CARROSSEL ---
    const scrollContainer = document.getElementById('metaScrollContainer');
    const btnLeft = document.getElementById('scrollLeftBtn');
    const btnRight = document.getElementById('scrollRightBtn');

    if (scrollContainer && btnLeft && btnRight) {
        
        // Quantidade de pixels para rolar a cada clique
        // (Aproximadamente o tamanho de 2 cards + gap)
        const SCROLL_AMOUNT = 360; 

        btnLeft.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: -SCROLL_AMOUNT,
                behavior: 'smooth'
            });
        });

        btnRight.addEventListener('click', () => {
            scrollContainer.scrollBy({
                left: SCROLL_AMOUNT,
                behavior: 'smooth'
            });
        });
    }
    
    // ATUALIZAÇÃO: Certifique-se de chamar a renderização inicial
    renderGlobalStats();

    // --- INICIALIZAÇÃO ---
    // Precisamos rodar isso APÓS o DOM estar carregado (já estamos dentro do DOMContentLoaded)
    buildGlobalAgentData();
    renderIndividualWinRates(); // Função antiga que coloca WR nos cards grandes
    renderGlobalStats(); // Renderiza o novo HUD

    // --- 3. Lógica de Filtragem e Busca ---
    // --- 3. Lógica de Filtragem e Busca ---
    function filterCards(category, searchText) {
        searchText = searchText.toLowerCase();
        
        let visibleCountPerSection = {};
        sections.forEach(section => {
            const sectionClass = section.getAttribute('data-class');
            visibleCountPerSection[sectionClass] = 0;
        });

        cards.forEach(card => {
            const agentName = card.getAttribute('data-name').toLowerCase();
            const agentClass = card.getAttribute('data-class');
            
            const matchesCategory = category === 'all' || agentClass === category;
            const matchesSearch = agentName.includes(searchText);

            card.classList.remove('is-searched');

            if (matchesCategory && matchesSearch) {
                card.style.display = 'block';
                visibleCountPerSection[agentClass]++;
                
                if (searchText.length > 0) {
                        card.classList.add('is-searched');
                }
            } else {
                card.style.display = 'none';
            }
        });

        sections.forEach(section => {
            const sectionClass = section.getAttribute('data-class');

            if (category === 'all') {
                if (visibleCountPerSection[sectionClass] > 0) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            } else {
                if (sectionClass === category) {
                        section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            }
        });

        // O BLOCO QUE ESCONDIA A UNIVERSAL BOX FOI REMOVIDO DAQUI
    }

    // Event Listeners dos Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');
            filterCards(filterValue, searchInput.value);
        });
    });

    // Event Listener da Busca
    searchInput.addEventListener('input', (e) => {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filterValue = activeBtn.getAttribute('data-filter');
        filterCards(filterValue, e.target.value);
        
        if (e.target.value.length > 0) {
            searchForm.classList.add('active-search');
        } else {
            searchForm.classList.remove('active-search');
        }
    });

    // Inicializa filtros
    filterCards('all', ''); 

    // --- 4. Lógica do MODAL (Atualizada) ---
    function openAgentModal(card) {
        const nameKey = card.getAttribute('data-name').toLowerCase(); // Chave para pegar os dados
        const displayTitle = card.querySelector('.agent-name-styled') ? card.querySelector('.agent-name-styled').textContent : card.querySelector('.agent-name').childNodes[0].textContent.trim();
        const imgSrc = card.querySelector('.agent-img-box img').src;
        
        // Elementos básicos
        modalTitle.innerText = displayTitle;
        modalImg.src = imgSrc;
        modalClass.innerText = card.getAttribute('data-class'); 

        // --- NOVA LÓGICA DE WIN RATE NO MODAL ---
        const statsBox = document.getElementById('modalStatsBox');
        const winRate = agentStatsData[nameKey] || 'N/A';
        
        if (typeof winRate === 'number') {
            const rateClass = getRateClass(winRate); // Usa sua função existente para cor (Verde/Amarelo/Vermelho)
            
            // Calculo da largura da barra decorativa (Ex: 50% = metade da barra)
            // Normalizamos para visual: (Rate - 40) * 5 para exagerar as diferenças visuais na barra
            const barWidth = Math.max(0, Math.min(100, (winRate - 40) * 5)); 

            statsBox.innerHTML = `
                <div class="stat-block">
                    <div class="stat-label">
                        <span class="text-pt">TAXA DE VITÓRIA</span>
                        <span class="text-en">WIN RATE</span>
                    </div>
                    <div class="stat-value-row">
                        <span class="stat-number ${rateClass}">${winRate}%</span>
                        <div class="stat-visual-bar-track">
                            <div class="stat-visual-bar-fill ${rateClass}" style="width: ${barWidth}%"></div>
                        </div>
                    </div>
                </div>
                <div class="stat-decoration">
                    <span class="icon-pulse">●</span> LIVE DATA
                </div>
            `;
            statsBox.style.display = 'flex';
        } else {
            statsBox.style.display = 'none'; // Esconde se não tiver dados
        }
        // ----------------------------------------

        // Lógica de Contexto/Reason (Mantida igual)
        const reasonDiv = card.querySelector('.agent-reason');
        if (reasonDiv && reasonDiv.innerText.trim().length > 0) {
            modalReasonText.innerHTML = reasonDiv.innerHTML;
            modalContextBox.style.display = 'block';
        } else {
            modalContextBox.style.display = 'none';
        }

        // Lógica de Habilidades (Mantida igual)
        modalAbilitiesGrid.innerHTML = ''; 
        const abilityGroups = card.querySelectorAll('.ability-group');

        if(abilityGroups.length > 0) {
            abilityGroups.forEach(group => {
                const abilityCard = document.createElement('div');
                abilityCard.className = 'modal-ability-card';
                const titleEl = group.querySelector('.ability-name');
                const titleText = titleEl ? titleEl.innerText : 'Habilidade';
                const listEl = group.querySelector('ul');
                const noteEl = group.querySelector('.ability-note');

                let cardHTML = `<div class="modal-ability-title">${titleText}</div>`;
                if (listEl) cardHTML += listEl.outerHTML; 
                if (noteEl) cardHTML += `<p class="modal-ability-note">${noteEl.innerHTML}</p>`;

                abilityCard.innerHTML = cardHTML;
                modalAbilitiesGrid.appendChild(abilityCard);
            });
        } else {
            modalAbilitiesGrid.innerHTML = '<p style="color: var(--text-muted)">Nenhuma alteração específica listada.</p>';
        }

        // Estilos dinâmicos de cor
        modalContent.className = 'modal-content theme-dynamic';
        const colors = agentColors[nameKey] || agentColors['default'];

        modalContent.style.setProperty('--theme-glow', colors.glow);
        modalContent.style.setProperty('--theme-p1', colors.p1);
        modalContent.style.setProperty('--theme-p2', colors.p2);
        modalContent.style.setProperty('--theme-p3', colors.p3);

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    // --- 5. Event Listeners do Modal ---
    cards.forEach(card => {
        card.style.cursor = 'pointer'; 
        card.addEventListener('click', () => {
            openAgentModal(card);
        });
    });

    function closeModalFunc() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; 
    }

    closeModal.addEventListener('click', closeModalFunc);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFunc();
        }
    });

    // --- 6. Lógica dos Botões Flutuantes ---
    
    // 6.1 - Botão "Ir para Chat"
    if(scrollToChatBtn && commsSection) {
        scrollToChatBtn.addEventListener('click', () => {
            // Aumentei o offset para -250 (vai parar bem acima do título agora)
            const yOffset = 30;
            
            const elementTop = commsSection.getBoundingClientRect().top;
            const yPosition = elementTop + window.scrollY + yOffset;

            window.scrollTo({
                top: yPosition,
                behavior: 'smooth'
            });

            // A MÁGICA ESTÁ AQUI:
            // O { preventScroll: true } impede que o navegador dê aquele "pulo"
            // para baixo tentando mostrar o input. Ele foca, mas a tela fica onde mandamos.
            setTimeout(() => {
                if(commsInput) commsInput.focus({ preventScroll: true });
            }, 800);
        });
    }

    // 6.2 - Botão "Subir Tudo"
    if(scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 6.3 - Mostrar/Esconder botão de subir
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.remove('hidden');
        } else {
            scrollTopBtn.classList.add('hidden');
        }
    });

    

    // --- 7. Lógica do Chat (COM FIREBASE) ---
    const randomAgents = ["Brimstone", "Viper", "Omen", "Killjoy", "Cypher", "Sova", "Sage", "Phoenix", "Jett", "Reyna", "Raze", "Breach", "Skye", "Yoru", "Astra", "KAY/O", "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove", "Vyse", "Tejo", "Waylay", "Veto"];

    // Função para renderizar mensagem na tela (apenas visual)
    const chatNameColors = [
        '#ff4655', // Valorant Red
        '#17e588', // Viper Green
        '#ffce00', // Killjoy Yellow
        '#58a0f0', // Sova Blue
        '#e58bf5', // Reyna Purple
        '#ffae00', // Raze Orange
        '#40e0d0', // Sage Teal
        '#a4f0f5', // Jett Cyan
        '#ffffff',  // White
        '#ff6f91', // Rosa neon suave
        '#7cffcb', // Verde neon limpo
        '#8b5cf6', // Roxo vibrante (tipo Discord)
        '#ff934f', // Laranja quente moderno
        '#4dff91', // Verde água neon
        '#00c6ff', // Azul neon
        '#b0f566', // Verde pastel vibrante
        '#ffd6e0', // Rosa pastel
        '#c7f9cc', // Verde relaxante
        '#f8f991', // Amarelo suave
        '#ff9de2', // Rosa elétrico
        '#5ce1e6', // Ciano gamer
        '#647dff', // Azul arroxeado
        '#ff3131', // Vermelho neon
        '#ffe66d', // Amarelo quente
        '#9bf6ff', // Azul pastel brilhante
        '#ffadad', // Rosa coral
        '#d0bdf4' // Lilás elegante
    ];

    // Função para renderizar mensagem na tela
    function renderMessage(id, data) {
        // Evita duplicatas se a mensagem já existe
        if (document.getElementById(id)) return;

        const msgDiv = document.createElement('div');
        
        // Se a mensagem for 'SYSTEM', aplica o estilo de sistema
        const isSystem = data.name === '[SYSTEM]';
        msgDiv.className = isSystem ? 'chat-message system' : 'chat-message';
        msgDiv.id = id; // ID único do Firestore

        // --- LÓGICA DE COR ALEATÓRIA ---
        let colorStyle = '';
        
        if (!isSystem) {
            // Se NÃO for sistema, sorteia uma cor da lista
            const randomColor = chatNameColors[Math.floor(Math.random() * chatNameColors.length)];
            colorStyle = `style="color: ${randomColor};"`;
        }
        // Se for System, a variável colorStyle fica vazia e o CSS define a cor (vermelho)

        // Formata a data
        let timeString = '';
        if (data.timestamp) {
            const date = data.timestamp.toDate(); 
            timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Injeta o HTML com a cor sorteada no span 'chat-sender'
        msgDiv.innerHTML = `
            <span class="chat-sender" ${colorStyle}>${data.name}</span>
            <span class="chat-text">${data.text}</span>
            <span class="chat-timestamp">${timeString}</span>
        `;
        
        commsFeed.appendChild(msgDiv);
        commsFeed.scrollTop = commsFeed.scrollHeight; // Rola para baixo
    }

    // --- ESCUTAR MENSAGENS EM TEMPO REAL ---
    // Isso substitui o localStorage.getItem. 
    // O onSnapshot roda toda vez que alguém posta algo novo no banco.
    const q = query(collection(db, "comms_channel"), orderBy("timestamp", "asc"), limit(50));
    
    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                renderMessage(change.doc.id, change.doc.data());
            }
        });
    });


    // --- Lógica de Teclas para o Textarea (Enter envia, Shift+Enter pula linha) ---
    // --- Lógica de Teclas para o Textarea ---
    if (commsInput) {
        const MAX_LINES = 5;

        commsInput.addEventListener('keydown', (e) => {
            // Detecta se é mobile baseando-se na largura da tela (mesmo breakpoint do CSS)
            const isMobile = window.innerWidth <= 600;
            const currentLines = commsInput.value.split('\n').length;

            if (e.key === 'Enter') {
                
                // 1. Lógica MOBILE: O Enter deve agir normalmente (pular linha)
                if (isMobile) {
                    // A única restrição no mobile é o limite de linhas
                    if (currentLines >= MAX_LINES) {
                        e.preventDefault(); // Impede a 6ª linha
                        // Feedback visual de erro
                        commsInput.style.borderColor = 'var(--accent-red)';
                        setTimeout(() => commsInput.style.borderColor = '', 200);
                    }
                    // IMPORTANTE: Damos return aqui para que o código NÃO desça para a parte de enviar
                    return; 
                }

                // 2. Lógica DESKTOP: Enter envia, Shift+Enter pula linha
                // Se NÃO estiver segurando Shift ou Ctrl -> Tenta ENVIAR
                if (!e.shiftKey && !e.ctrlKey) {
                    e.preventDefault(); // Impede o pulo de linha padrão
                    commsForm.requestSubmit(); // Envia o formulário
                } 
                // Se estiver segurando Shift (tentando pular linha) -> Verifica o limite
                else {
                    if (currentLines >= MAX_LINES) {
                        e.preventDefault();
                        commsInput.style.borderColor = 'var(--accent-red)';
                        setTimeout(() => commsInput.style.borderColor = '', 200);
                    }
                }
            }
        });

        // Mantém a proteção contra colar texto gigante
        commsInput.addEventListener('input', (e) => {
            const lines = commsInput.value.split('\n');
            if (lines.length > MAX_LINES) {
                commsInput.value = lines.slice(0, MAX_LINES).join('\n');
                commsInput.style.borderColor = 'var(--accent-red)';
                setTimeout(() => commsInput.style.borderColor = '', 200);
            }
        });
    }

    // --- ENVIAR MENSAGEM ---
    commsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = commsInput.value.trim();
        const customName = commsNameInput.value.trim();
        
        if(!text) return;

        let finalName;
        if (customName.length > 0) {
            finalName = customName;
        } else {
            finalName = randomAgents[Math.floor(Math.random() * randomAgents.length)];
        }

        // Limpa o input imediatamente para melhor UX
        commsInput.value = '';

        try {
            // Salva no Firestore (Nuvem)
            await addDoc(collection(db, "comms_channel"), {
                name: finalName,
                text: text,
                timestamp: new Date() // Salva o horário do servidor
            });
            console.log("Mensagem enviada para o banco!");
        } catch (error) {
            console.error("Erro ao enviar mensagem: ", error);
            alert("Erro de conexão com o servidor da Riot (Firebase). Tente novamente.");
        }
    });

});