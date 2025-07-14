const dbUsuarios = new PouchDB('usuarios');
const dbFilmes = new PouchDB('filmes');

async function criarAdminPadrao() {
  try {
    const resultado = await dbUsuarios.allDocs({ include_docs: true });
    const existeAdmin = resultado.rows.some(row => row.doc.login.toLowerCase() === 'admin');

    if (!existeAdmin) {
      await dbUsuarios.put({
        _id: new Date().toISOString(),
        tipo: 'admin',
        nome: 'Administrador',
        login: 'admin',
        senha: '123',
        acesso: 'admin'
      });
      console.log('Usuário admin criado.');
    }
  } catch (err) {
    console.error('Erro ao criar admin padrão:', err);
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginInput = document.getElementById('login');
  const senhaInput = document.getElementById('senha');
  const mensagemErro = document.getElementById('mensagem-erro');

  mensagemErro.textContent = '';

  const login = loginInput.value.trim().toLowerCase();
  const senha = senhaInput.value;

  if (!login) {
    mensagemErro.textContent = 'Por favor, preencha o campo Login.';
    loginInput.focus();
    return;
  }
  if (!senha) {
    mensagemErro.textContent = 'Por favor, preencha o campo Senha.';
    senhaInput.focus();
    return;
  }

  try {
    const result = await dbUsuarios.allDocs({ include_docs: true });
    console.log('Usuários cadastrados:', result.rows.map(r => r.doc.login));

    const usuario = result.rows.find(row => {
      return row.doc.login.toLowerCase() === login && row.doc.senha === senha;
    });

    if (usuario) {
      localStorage.setItem('usuario', JSON.stringify(usuario.doc));


      if (usuario.doc.acesso === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      mensagemErro.textContent = 'Usuário ou senha incorretos.';
      senhaInput.focus();
    }
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    mensagemErro.textContent = 'Erro interno, tente novamente.';
  }
});

criarAdminPadrao();
