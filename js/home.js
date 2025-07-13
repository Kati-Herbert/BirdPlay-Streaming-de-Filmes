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
const detalhesSecao = document.getElementById('detalhes-filme');
const fecharDetalhes = document.getElementById('fecharDetalhes');
let filmeAberto = null;

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
        esconderDetalhes();
      });
    });

  } catch (err) {
    console.error('Erro ao carregar filmes:', err);
  }
}

function mostrarFilmes(filmes) {
  listaFilmes.innerHTML = '';
  detalhesSecao.style.display = 'none';
  filmeAberto = null;
  filmes.forEach(filme => listaFilmes.appendChild(criarCardFilme(filme)));
}

function criarCardFilme(filme) {
  const div = document.createElement('div');
  div.className = 'filme-card';
  div.innerHTML = `
    <img src="${filme.imagem}" alt="${filme.titulo}">
    <h4>${filme.titulo}</h4>
  `;
  div.addEventListener('click', () => mostrarDetalhes(filme, div));
  return div;
}

function mostrarDetalhes(filme, card) {
  if (filmeAberto === card) {
    esconderDetalhes();
    return;
  }

  filmeAberto = card;

  document.getElementById('tituloFilme').textContent = filme.titulo;
  document.getElementById('imagemFilme').src = filme.imagem;
  document.getElementById('categoriaFilme').textContent = `Gênero: ${filme.categoria || 'N/A'}`;
  document.getElementById('descricaoFilme').textContent = filme.sinopse || 'Sem descrição.';

  const btnTrailer = document.getElementById('btnAssistirTrailer');
  if (filme.trailer) {
    btnTrailer.style.display = 'inline-block';
    btnTrailer.onclick = () => {
      window.open(filme.trailer, '_blank', 'width=800,height=600');
    };
  } else {
    btnTrailer.style.display = 'none';
    btnTrailer.onclick = null;
  }

  detalhesSecao.style.display = 'block';
}

function esconderDetalhes() {
  detalhesSecao.style.display = 'none';
  filmeAberto = null;
}

fecharDetalhes.addEventListener('click', () => {
  esconderDetalhes();
});

carregarFilmes();