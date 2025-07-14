const dbUsuarios = new PouchDB('usuarios');
const dbFilmes = new PouchDB('filmes');

document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const login = document.getElementById('login').value.trim().toLowerCase();
  const senha = document.getElementById('senha').value;

  if (!nome || !login || !senha) {
    alert('Preencha todos os campos');
    return;
  }

  try {
    const result = await dbUsuarios.allDocs({ include_docs: true });
    const existe = result.rows.some(row => row.doc.login.toLowerCase() === login);

    if (existe) {
      alert('Este login já está em uso.');
      return;
    }

    await dbUsuarios.put({
      _id: new Date().toISOString(),
      tipo: 'usuario',
      nome,
      login,
      senha,
      acesso: 'usuario'
    });

    alert('Cadastro realizado com sucesso!');
    window.location.href = 'login.html';

  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    alert('Erro no cadastro, tente novamente.');
  }
});