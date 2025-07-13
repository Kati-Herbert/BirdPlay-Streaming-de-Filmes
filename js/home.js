const dbFilmes = new PouchDB('filmes');

const usuario = JSON.parse(localStorage.getItem('usuario'));
if (!usuario) {
  window.location.href = 'login.html';
} else {
  document.getElementById('nomeUsuario').textContent = usuario.nome;
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

const listaFilmes = document.getElementById('lista-filmes');
let detalheAberto = null; // para guardar o elemento detalhe atualmente aberto

async function carregarFilmes() {
  try {
    const result = await dbFilmes.allDocs({ include_docs: true });
    const filmes = result.rows.map(row => row.doc);

    mostrarFilmes(filmes);

    document.querySelectorAll('.categoria-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoria = btn.dataset.categoria;
        if (categoria === 'todos') {
          mostrarFilmes(filmes);
        } else {
          const filtrados = filmes.filter(f => f.categoria?.toLowerCase() === categoria.toLowerCase());
          mostrarFilmes(filtrados);
        }
        removerDetalhe();
      });
    });

  } catch (err) {
    console.error('Erro ao carregar filmes:', err);
  }
}

function mostrarFilmes(filmes) {
  listaFilmes.innerHTML = '';
  detalheAberto = null;
  filmes.forEach(filme => listaFilmes.appendChild(criarCardFilme(filme)));
}

function criarCardFilme(filme) {
  const div = document.createElement('div');
  div.className = 'filme-card';
  div.innerHTML = `
    <img src="${filme.imagem}" alt="${filme.titulo}">
    <h4>${filme.titulo}</h4>
  `;
  div.addEventListener('click', () => toggleDetalhes(filme, div));
  return div;
}

function toggleDetalhes(filme, card) {
  // Se já estiver aberto o detalhe para esse card, fecha
  if (detalheAberto && detalheAberto.previousElementSibling === card) {
    removerDetalhe();
    return;
  }

  // Remove o detalhe aberto, se existir
  removerDetalhe();

  // Cria o elemento de detalhes
  const detalheDiv = document.createElement('div');
  detalheDiv.className = 'detalhes-filme';
  detalheDiv.innerHTML = `
    <div class="detalhes-container">
      <div class="poster"><img src="${filme.imagem}" alt="${filme.titulo}"></div>
      <div class="info">
        <h3>${filme.titulo}</h3>
        <p><strong>Gênero:</strong> ${filme.categoria || 'N/A'}</p>
        <p>${filme.sinopse || 'Sem descrição.'}</p>
        ${filme.trailer ? `<button class="btn-trailer">Assistir Trailer</button>` : ''}
      </div>
    </div>
  `;

  // Evento para o botão de trailer
  if (filme.trailer) {
    detalheDiv.querySelector('.btn-trailer').addEventListener('click', () => {
      window.open(filme.trailer, '_blank', 'width=800,height=600');
    });
  }

  // Insere o detalhe logo após o card clicado
  card.insertAdjacentElement('afterend', detalheDiv);

  detalheAberto = detalheDiv;
}

function removerDetalhe() {
  if (detalheAberto) {
    detalheAberto.remove();
    detalheAberto = null;
  }
}

carregarFilmes();