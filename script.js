document.addEventListener('DOMContentLoaded', () => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const searchInput = document.getElementById('searchInput');
            const cards = document.querySelectorAll('.agent-card');
            const sections = document.querySelectorAll('.class-section');
            const universalBox = document.querySelector('.universal-box');

            // Função que aplica a filtragem (chamada tanto pelo clique quanto pela busca)
            function filterCards(category, searchText) {
                searchText = searchText.toLowerCase();
                
                // Mapeia seções visíveis
                let visibleCountPerSection = {};
                sections.forEach(section => {
                    const sectionClass = section.getAttribute('data-class');
                    visibleCountPerSection[sectionClass] = 0;
                });

                // 1. FILTRAGEM DOS CARDS
                cards.forEach(card => {
                    const agentName = card.getAttribute('data-name').toLowerCase();
                    const agentClass = card.getAttribute('data-class');
                    
                    const matchesCategory = category === 'all' || agentClass === category;
                    const matchesSearch = agentName.includes(searchText);

                    // --- INÍCIO DA MUDANÇA ---
                    // 1a. Remove a classe de "imagem alta" de todos os cards primeiro
                    card.classList.remove('is-searched');
                    // --- FIM DA MUDANÇA ---

                    if (matchesCategory && matchesSearch) {
                        card.style.display = 'block';
                        visibleCountPerSection[agentClass]++;
                        
                        // --- INÍCIO DA MUDANÇA ---
                        // 1b. Adiciona a classe APENAS se houver texto de busca
                        if (searchText.length > 0) {
                             card.classList.add('is-searched');
                        }
                        // --- FIM DA MUDANÇA ---

                    } else {
                        card.style.display = 'none';
                    }
                });

                // 2. FILTRAGEM DOS TÍTULOS DE SEÇÃO
                sections.forEach(section => {
                    const sectionClass = section.getAttribute('data-class');
                    

                    

                    if (category === 'all') {
                        // Se for "Todos", só esconde a seção se ela não tiver cards visíveis (após a busca)
                        if (visibleCountPerSection[sectionClass] > 0) {
                            section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    } else {
                        // Se for uma categoria específica, esconde as outras seções
                        if (sectionClass === category) {
                             section.style.display = 'block';
                        } else {
                            section.style.display = 'none';
                        }
                    }


                });

                if (searchText.length > 0) {
                    universalBox.style.display = 'none';
                } else {
                    // Se não houver texto de busca, exibe o bloco (considerando a filtragem de categorias)
                    // Note: Este bloco é fixo, não depende da categoria, então sempre o exibimos se a busca estiver vazia.
                    universalBox.style.display = 'block'; 
                }
                // --- FIM DA MUDANÇA PARA O BLOCO UNIVERSAL ---
            }
            



            // Evento para botões de filtro
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const filterValue = btn.getAttribute('data-filter');
                    filterCards(filterValue, searchInput.value);
                });
            });

            // Evento para barra de busca
            searchInput.addEventListener('input', (e) => {
                const activeBtn = document.querySelector('.filter-btn.active');
                const filterValue = activeBtn.getAttribute('data-filter');
                filterCards(filterValue, e.target.value);
                
                // Adiciona/Remove a classe para mostrar/esconder o botão 'x' de limpar
                if (e.target.value.length > 0) {
                    searchForm.classList.add('active-search');
                } else {
                    searchForm.classList.remove('active-search');
                }
            });
            
            // Referência ao formulário e botão de limpar
            const searchForm = document.getElementById('searchForm');


            // Inicializa com 'all' para garantir que tudo esteja visível ao carregar
            filterCards('all', ''); 
        });