const WebSocket = require('ws');

// URL do WebSocket
const url = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('Conectado ao WebSocket');

    // Enviar as requisições na ordem especificada
    ws.send('40/mapasinotico');
    ws.send('42/mapasinotico,["setupSubs",["_"]]');
    ws.send('42/mapasinotico,["setupSubs",["565f45f448cfba8f313a1cc7:565f45f448cfba8f313a1cc5:*","565f45f448cfba8f313a1cc7:565f45f448cfba8f313a1cc6:*"]]');

    // Enviar '2' a cada 5 segundos para manter a conexão ativa
    setInterval(() => {
        ws.send('2');
    }, 5000);
});

ws.on('message', (data) => {
    console.log('Mensagem recebida:', data);

    // Verificar se a mensagem começa com '42/mapasinotico,'
    if (data.startsWith('42/mapasinotico,')) {
        try {
            // Remover o prefixo '42/mapasinotico,' e fazer o parse do JSON
            const jsonString = data.slice('42/mapasinotico,'.length);
            const parsedData = JSON.parse(jsonString)[1];

            // Exibir o valor de 'prefixoVeiculo'
            if (parsedData && parsedData.prefixoVeiculo) {
                console.log('prefixoVeiculo:', parsedData.prefixoVeiculo);
            }
        } catch (error) {
            console.error('Erro ao fazer parse do JSON:', error);
        }
    }
});

ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
});

ws.on('close', () => {
    console.log('Conexão WebSocket fechada');
});
