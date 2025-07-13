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
        detalhesSecao.style.display = 'none';
      });
    });

  } catch (err) {
    console.error('Erro ao carregar filmes:', err);
  }
}

function mostrarFilmes(filmes) {
  listaFilmes.innerHTML = '';
  filmes.forEach(filme => listaFilmes.appendChild(criarCardFilme(filme)));
}

function criarCardFilme(filme) {
  const div = document.createElement('div');
  div.className = 'filme-card';
  div.innerHTML = `
    <img src="${filme.imagem}" alt="${filme.titulo}">
    <h4>${filme.titulo}</h4>
  `;
  div.addEventListener('click', () => mostrarDetalhes(filme));
  return div;
}

function mostrarDetalhes(filme) {
  document.getElementById('tituloFilme').textContent = filme.titulo;
  document.getElementById('imagemFilme').src = filme.imagem;
  document.getElementById('anoFilme').textContent = `Ano: ${filme.ano || 'N/A'}`;
  document.getElementById('categoriaFilme').textContent = `Gênero: ${filme.categoria || 'N/A'}`;
  document.getElementById('descricaoFilme').textContent = filme.descricao || 'Sem descrição.';

  const trailer = document.getElementById('trailerFilme');
  if (filme.trailer) {
    if (filme.trailer.includes('youtube')) {
      trailer.src = filme.trailer.replace('watch?v=', 'embed/');
    } else if (filme.trailer.includes('vimeo')) {
      trailer.src = filme.trailer.replace('vimeo.com/', 'player.vimeo.com/video/');
    } else {
      trailer.src = filme.trailer;
    }
    trailer.style.display = 'block';
  } else {
    trailer.style.display = 'none';
  }

  detalhesSecao.style.display = 'block';
}

fecharDetalhes.addEventListener('click', () => {
  detalhesSecao.style.display = 'none';
});

carregarFilmes();
