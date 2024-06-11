const fs = require('fs');

async function enviarMensagemTexto(client, jid, texto) {
    await client.sendMessage(jid, { text: texto });
}

async function enviarImagem(client, jid, caminho, legenda = '') {
    const buffer = fs.readFileSync(caminho);
    await client.sendMessage(jid, { image: buffer, caption: legenda });
}

async function enviarVideo(client, jid, caminho, legenda = '') {
    const buffer = fs.readFileSync(caminho);
    await client.sendMessage(jid, { video: buffer, caption: legenda });
}

async function enviarPDF(client, jid, caminho, nome = '', legenda = '') {
    const buffer = fs.readFileSync(caminho);
    await client.sendMessage(jid, { document: buffer, caption: legenda, fileName: nome, mimetype: 'application/pdf' });
}

module.exports = {
    enviarMensagemTexto,
    enviarImagem,
    enviarVideo,
    enviarPDF,
};
