const dbUsuarios = new PouchDB('usuarios');
const dbFilmes = new PouchDB('filmes');

async function criarAdminPadrao() {
  try {
    const resultado = await dbUsuarios.allDocs({ include_docs: true });
    const existeAdmin = resultado.rows.some(row => row.doc.login?.toLowerCase() === 'admin');
    if (!existeAdmin) {
      await dbUsuarios.put({
        _id: new Date().toISOString(),
        nome: 'Administrador',
        login: 'admin',
        senha: '123',
        tipo: 'admin',
        acesso: 'admin'
      });
      console.log('Usuário admin criado.');
    }
  } catch (err) {
    console.error('Erro ao criar admin padrão:', err);
  }
}

criarAdminPadrao();