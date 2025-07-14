const dbUsuarios = new PouchDB('usuarios');
const dbFilmes = new PouchDB('filmes');

document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value;

    const usuario = {
        _id: new Date().toISOString(),
        nome,
        email,
        senha,
        tipo
    };

    try {
        await dbUsuarios.put(usuario);
        alert('Usuário cadastrado com sucesso!');
        document.getElementById('formUsuario').reset();
        listarUsuarios();
    } catch (err) {
        console.error('Erro ao cadastrar usuário:', err);
    }
});

async function listarUsuarios() {
    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = '';
    const result = await dbUsuarios.allDocs({ include_docs: true });
    result.rows.forEach(row => {
        const usuario = row.doc;
        const li = document.createElement('li');
        li.innerHTML = `${usuario.nome} - ${usuario.email} - ${usuario.tipo}
            <button onclick="removerUsuario('${usuario._id}', '${usuario._rev}')">Excluir</button>`;
        lista.appendChild(li);
    });
}

async function removerUsuario(id, rev) {
    try {
        await dbUsuarios.remove(id, rev);
        listarUsuarios();
    } catch (err) {
        console.error('Erro ao remover usuário:', err);
    }
}

window.onload = listarUsuarios;