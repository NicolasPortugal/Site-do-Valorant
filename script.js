document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Seleção de Elementos ---
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
        'tejo':      { glow: 'rgba(100, 100, 100, 0.4)', p1: '#ffffff', p2: '#aaaaaa', p3: '#555555' }, // Adicionado fallback

        // Sentinelas
        'sage':      { glow: 'rgba(64, 224, 208, 0.3)', p1: '#ccfff9', p2: '#40e0d0', p3: '#1a756b' },
        'cypher':    { glow: 'rgba(200, 200, 200, 0.3)', p1: '#ffffff', p2: '#aaaaaa', p3: '#555555' },
        'killjoy':   { glow: 'rgba(255, 215, 0, 0.3)', p1: '#ffffcc', p2: '#ffd700', p3: '#b29600' },
        'chamber':   { glow: 'rgba(219, 180, 80, 0.4)', p1: '#ffecaa', p2: '#dbb450', p3: '#8c6e23' },
        'deadlock':  { glow: 'rgba(150, 180, 200, 0.4)', p1: '#e0f0ff', p2: '#96b4c8', p3: '#4a6a7d' },
        'vyse':      { glow: 'rgba(150, 150, 150, 0.4)', p1: '#dcdcdc', p2: '#808080', p3: '#2f2f2f' },
        'veto':      { glow: 'rgba(150, 150, 150, 0.4)', p1: '#dcdcdc', p2: '#808080', p3: '#2f2f2f' }, // Fallback

        // Padrão
        'default':   { glow: 'rgba(255, 255, 255, 0.1)', p1: '#ffffff', p2: '#888888', p3: '#333333' }
    };

    // --- 3. Lógica de Filtragem e Busca ---
    function filterCards(category, searchText) {
        searchText = searchText.toLowerCase();
        
        let visibleCountPerSection = {};
        sections.forEach(section => {
            const sectionClass = section.getAttribute('data-class');
            visibleCountPerSection[sectionClass] = 0;
        });

        // Filtrar Cards
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

        // Filtrar Seções
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

        // Lógica do Universal Box
        if (searchText.length > 0) {
            universalBox.style.display = 'none';
        } else {
            universalBox.style.display = 'block'; 
        }
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

    // --- 4. Lógica do MODAL (A Função Nova) ---
    function openAgentModal(card) {
        const name = card.getAttribute('data-name');
        const agentClassType = card.getAttribute('data-class');
        
        // Pegar dados do card
        const displayTitle = card.querySelector('.agent-name').childNodes[0].textContent.trim();
        const imgSrc = card.querySelector('.agent-img-box img').src;
        
        // Preencher Cabeçalho
        modalTitle.innerText = displayTitle;
        modalImg.src = imgSrc;
        modalClass.innerText = agentClassType; 

        // Preencher Contexto Geral (Dev Notes)
        const reasonDiv = card.querySelector('.agent-reason');
        // Verifica se existe texto dentro da div
        if (reasonDiv && reasonDiv.innerText.trim().length > 0) {
            modalReasonText.innerText = reasonDiv.innerText.trim();
            modalContextBox.style.display = 'block';
        } else {
            modalContextBox.style.display = 'none';
        }

        // Preencher Grid de Habilidades
        modalAbilitiesGrid.innerHTML = ''; // Limpa anterior

        // Seleciona todos os grupos de habilidade do card clicado
        const abilityGroups = card.querySelectorAll('.ability-group');

        if(abilityGroups.length > 0) {
            abilityGroups.forEach(group => {
                const abilityCard = document.createElement('div');
                abilityCard.className = 'modal-ability-card';

                // 1. Pega o Título
                const titleEl = group.querySelector('.ability-name');
                const titleText = titleEl ? titleEl.innerText : 'Habilidade';
                
                // 2. Pega a Lista (ul)
                const listEl = group.querySelector('ul');
                
                // 3. Pega a Nota/Descrição (NOVA LÓGICA)
                const noteEl = group.querySelector('.ability-note');

                // Monta o HTML
                let cardHTML = `<div class="modal-ability-title">${titleText}</div>`;
                
                if (listEl) {
                    cardHTML += listEl.outerHTML; 
                }

                // Se houver uma nota, adiciona ela (removendo o display:none implícito)
                if (noteEl) {
                    // Criamos um novo parágrafo com uma classe específica para o modal
                    cardHTML += `<p class="modal-ability-note">${noteEl.innerHTML}</p>`;
                }

                abilityCard.innerHTML = cardHTML;
                modalAbilitiesGrid.appendChild(abilityCard);
            });
        } else {
            modalAbilitiesGrid.innerHTML = '<p style="color: var(--text-muted)">Nenhuma alteração específica listada.</p>';
        }

        // Aplicar Cores Dinâmicas
        modalContent.className = 'modal-content theme-dynamic';
        const colors = agentColors[name.toLowerCase()] || agentColors['default'];

        modalContent.style.setProperty('--theme-glow', colors.glow);
        modalContent.style.setProperty('--theme-p1', colors.p1);
        modalContent.style.setProperty('--theme-p2', colors.p2);
        modalContent.style.setProperty('--theme-p3', colors.p3);

        // Mostrar Modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Trava scroll da página
    }

    // --- 5. Event Listeners do Modal (A parte que faltava) ---
    
    // Adiciona o evento de clique em CADA card
    cards.forEach(card => {
        card.style.cursor = 'pointer'; 
        card.addEventListener('click', () => {
            openAgentModal(card);
        });
    });

    // Função para fechar o modal
    function closeModalFunc() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Destrava scroll da página
    }

    closeModal.addEventListener('click', closeModalFunc);

    // Fecha ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModalFunc();
    });

    // Fecha com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFunc();
        }
    });

});