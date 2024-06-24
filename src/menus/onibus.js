const consultarLinhas = require('../utils/consultarLinhas');
const { enviarMensagemTexto } = require('../utils/funcaoMenasgens');

const handleOnibusMenu = async (client, jid, comando) => {
    if (comando === '608') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aae:*"]]', '608')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }  
    if (comando === '103') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a07:*","59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a08:*"]]', '103')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }  
    if (comando === '119') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e0:*","61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e1:*"]]', '119')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }  
    if (comando === '007') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["56f04f8b298843ac7b7e2184:56f04f8b298843ac7b7e2182:*","56f04f8b298843ac7b7e2184:56f04f8b298843ac7b7e2183:*"]]', '007')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }
    if (comando === '605') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["565f45f448cfba8f313a1cc7:565f45f448cfba8f313a1cc5:*","565f45f448cfba8f313a1cc7:565f45f448cfba8f313a1cc6:*"]]', '605')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }
    if (comando === 'c01') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["5ad7bf6f793e4f040d791d33:5ad7bf6f793e4f040d791d31:*","5ad7bf6f793e4f040d791d33:5ad7bf6f793e4f040d791d32:*"]]', 'C01')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }
    if (comando === '022') {            
        consultarLinhas('42/mapasinotico,["setupSubs",["577268a884ba5da50758b728:577268a884ba5da50758b726:*","577268a884ba5da50758b728:577268a884ba5da50758b727:*"]]', '022')
        .then(resultadoFinal => { 
            enviarMensagemTexto(client, jid, resultadoFinal);
        });
    }
};

module.exports = { handleOnibusMenu };
