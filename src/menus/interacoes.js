const { enviarMensagemTexto } = require('../utils/funcaoMenasgens');

const handleInteracoesMenu = async (client, jid, comando, nomeContato) => {
    if (comando === '1') {
        const saudacao = `Espero que você tenha um bom dia *${nomeContato}*!`;
        await enviarMensagemTexto(client, jid, saudacao);
    } 
    
    else if (comando === '2') {
        const saudacao = `*${nomeContato}*, veja outros projetos do meu criador! 👇👇👇\n\nhttps://github.com/josu-liveira`;
        await enviarMensagemTexto(client, jid, saudacao);
    } 
    
    else if (comando === '3') {
        const saudacao = `Nossa, *${nomeContato}*! Seu nome é muito bonito.`;
        await enviarMensagemTexto(client, jid, saudacao);
    }
};

module.exports = { handleInteracoesMenu };