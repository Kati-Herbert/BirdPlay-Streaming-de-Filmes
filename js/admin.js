const dbUsuarios = new PouchDB('usuarios');
const dbFilmes = new PouchDB('filmes');

document.getElementById('abaFilmes').onclick = () => trocarAba('filmes');
document.getElementById('abaUsuarios').onclick = () => trocarAba('usuarios');

function trocarAba(aba) {
  document.getElementById('secaoFilmes').classList.toggle('active', aba === 'filmes');
  document.getElementById('secaoUsuarios').classList.toggle('active', aba === 'usuarios');
  document.getElementById('abaFilmes').classList.toggle('active', aba === 'filmes');
  document.getElementById('abaUsuarios').classList.toggle('active', aba === 'usuarios');
}


let filmeEditandoId = null;

document.getElementById('formFilme').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const sinopse = document.getElementById('sinopse').value.trim();
  const trailer = document.getElementById('trailer').value.trim();
  const categoria = document.getElementById('categoria').value;
  const imagem = document.getElementById('imagem').value.trim();

  if (!categoria) {
    alert('Por favor, selecione uma categoria.');
    return;
  }
  if (!titulo || !sinopse || !trailer || !imagem) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    if (filmeEditandoId) {
      const doc = await dbFilmes.get(filmeEditandoId);
      doc.titulo = titulo;
      doc.sinopse = sinopse;
      doc.trailer = trailer;
      doc.categoria = categoria;
      doc.imagem = imagem;
      await dbFilmes.put(doc);
      alert('Filme atualizado com sucesso!');
      filmeEditandoId = null;
      document.querySelector('#formFilme button[type="submit"]').textContent = 'Cadastrar Filme';
    } else {
      const filme = {
        _id: new Date().toISOString(),
        titulo,
        sinopse,
        trailer,
        categoria,
        imagem
      };
      await dbFilmes.put(filme);
      alert('Filme cadastrado com sucesso!');
    }
    e.target.reset();
    listarFilmes();
  } catch (err) {
    console.error('Erro ao salvar filme:', err);
    alert('Erro ao salvar filme, veja o console.');
  }
});

async function listarFilmes() {
  const lista = document.getElementById('listaFilmes');
  lista.innerHTML = '';
  try {
    const result = await dbFilmes.allDocs({ include_docs: true, descending: true });
    result.rows.forEach(row => {
      const filme = row.doc;
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="${filme.imagem}" alt="Poster de ${filme.titulo}" class="filme-poster" />
        <div class="info">
          <strong>${filme.titulo}</strong> - ${filme.categoria}<br>
          <small>${filme.sinopse}</small><br>
          <a href="${filme.trailer}" target="_blank" rel="noopener noreferrer">Ver trailer</a>
        </div>
        <div class="botoes">
          <button onclick="prepararEdicaoFilme('${filme._id}')">Editar</button>
          <button onclick="removerFilme('${filme._id}', '${filme._rev}')">Excluir</button>
        </div>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao listar filmes:', err);
  }
}

async function prepararEdicaoFilme(id) {
  try {
    const doc = await dbFilmes.get(id);
    document.getElementById('titulo').value = doc.titulo;
    document.getElementById('sinopse').value = doc.sinopse;
    document.getElementById('trailer').value = doc.trailer;
    document.getElementById('categoria').value = doc.categoria;
    document.getElementById('imagem').value = doc.imagem;

    filmeEditandoId = id;
    document.querySelector('#formFilme button[type="submit"]').textContent = 'Salvar Alteração';

    trocarAba('filmes');
  } catch (err) {
    console.error('Erro ao carregar filme para edição:', err);
    alert('Erro ao carregar filme para edição, veja o console.');
  }
}

async function removerFilme(id, rev) {
  if (confirm('Tem certeza que deseja excluir este filme?')) {
    try {
      await dbFilmes.remove(id, rev);
      if (filmeEditandoId === id) {
        filmeEditandoId = null;
        document.querySelector('#formFilme button[type="submit"]').textContent = 'Cadastrar Filme';
        document.getElementById('formFilme').reset();
      }
      listarFilmes();
    } catch (err) {
      console.error('Erro ao remover filme:', err);
    }
  }
}


let usuarioEditandoId = null;

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const login = document.getElementById('login').value.trim();
  const senha = document.getElementById('senha').value;
  const tipo = document.getElementById('tipo').value;

  if (!nome || !login || !senha || !tipo) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    if (usuarioEditandoId) {
      const doc = await dbUsuarios.get(usuarioEditandoId);

      if (doc.login.toLowerCase() === 'admin') {
        alert('O usuário admin não pode ser editado!');
        return;
      }

      doc.nome = nome;
      doc.senha = senha;
      doc.tipo = tipo;
      doc.acesso = tipo;

      await dbUsuarios.put(doc);
      alert('Usuário atualizado com sucesso!');
      usuarioEditandoId = null;
      document.querySelector('#formUsuario button[type="submit"]').textContent = 'Cadastrar Usuário';
      document.getElementById('login').disabled = false;
      e.target.reset();
      listarUsuarios();
    } else {

      const resultado = await dbUsuarios.allDocs({ include_docs: true });
      const existeLogin = resultado.rows.some(row => row.doc.login.toLowerCase() === login.toLowerCase());
      if (existeLogin) {
        alert('Login já existe! Escolha outro.');
        return;
      }

      const usuario = {
        _id: new Date().toISOString(),
        nome,
        login,
        senha,
        tipo,
        acesso: tipo
      };

      await dbUsuarios.put(usuario);
      alert('Usuário cadastrado com sucesso!');
      e.target.reset();
      listarUsuarios();
    }
  } catch (err) {
    console.error('Erro ao salvar usuário:', err);
    alert('Erro ao salvar usuário, veja o console.');
  }
});

async function listarUsuarios() {
  const lista = document.getElementById('listaUsuarios');
  lista.innerHTML = '';
  try {
    const result = await dbUsuarios.allDocs({ include_docs: true, descending: true });
    result.rows.forEach(row => {
      const usuario = row.doc;
      const isAdmin = usuario.login.toLowerCase() === 'admin';

      const li = document.createElement('li');
      li.innerHTML = `
        <div class="info">
          <strong>${usuario.nome}</strong> - ${usuario.login} - ${usuario.tipo}
        </div>
        <div class="botoes">
          ${!isAdmin ? `<button onclick="prepararEdicaoUsuario('${usuario._id}')">Editar</button>
          <button onclick="removerUsuario('${usuario._id}', '${usuario._rev}')">Excluir</button>` : `<em>Administrador protegido</em>`}
        </div>
      `;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao listar usuários:', err);
  }
}

async function prepararEdicaoUsuario(id) {
  try {
    const doc = await dbUsuarios.get(id);
    if (doc.login.toLowerCase() === 'admin') {
      alert('O usuário admin não pode ser editado!');
      return;
    }

    document.getElementById('nome').value = doc.nome;
    document.getElementById('login').value = doc.login;
    document.getElementById('senha').value = doc.senha;
    document.getElementById('tipo').value = doc.tipo;

    document.getElementById('login').disabled = true;

    document.querySelector('#formUsuario button[type="submit"]').textContent = 'Salvar Alteração';

    usuarioEditandoId = id;

    trocarAba('usuarios');
  } catch (err) {
    console.error('Erro ao carregar usuário para edição:', err);
    alert('Erro ao carregar usuário para edição, veja o console.');
  }
}

async function removerUsuario(id, rev) {
  try {
    const doc = await dbUsuarios.get(id);
    if (doc.login.toLowerCase() === 'admin') {
      alert('O usuário admin não pode ser excluído!');
      return;
    }
  } catch (err) {
    console.error('Erro ao verificar usuário para exclusão:', err);
    return;
  }

  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      await dbUsuarios.remove(id, rev);
      if (usuarioEditandoId === id) {
        usuarioEditandoId = null;
        document.querySelector('#formUsuario button[type="submit"]').textContent = 'Cadastrar Usuário';
        document.getElementById('formUsuario').reset();
        document.getElementById('login').disabled = false;
      }
      listarUsuarios();
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
    }
  }
}


const inputLogin = document.getElementById('login');
inputLogin.addEventListener('focus', () => {
  if (inputLogin.disabled) {
    alert('O login não pode ser alterado durante a edição.');
    inputLogin.blur();
  }
});


window.onload = () => {
  trocarAba('filmes');
  listarFilmes();
  listarUsuarios();
};