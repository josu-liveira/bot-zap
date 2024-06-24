const WebSocket = require('ws');
const axios = require('axios');

async function obterPontosDeParada(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter pontos de parada:', error.message);
        return [];
    }
}

async function conectarWebSocket(linha, pontosDeParada) {
    let wsUrl, setupSubsMsg;
    if (linha === '608') {
        wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        setupSubsMsg = '42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aae:*"]]';
    } else if (linha === '103') {
        wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        setupSubsMsg = '42/mapasinotico,["setupSubs",["59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a07:*","59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a08:*"]]';
    } else if (linha === '119') {
        wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        setupSubsMsg = '42/mapasinotico,["setupSubs",["61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e0:*","61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e1:*"]]';
    } else {
        throw new Error('Linha inválida');
    }

    const socket = new WebSocket(wsUrl);

    socket.on('open', () => {
        console.log(`Conectado à linha ${linha}`);
        socket.send('40/mapasinotico');
        socket.send(setupSubsMsg);

        // Envia pings periodicamente para manter a conexão ativa
        const pingInterval = setInterval(() => {
            socket.send('2');
        }, 25000);

        socket.on('close', () => {
            clearInterval(pingInterval);
            console.log('Conexão fechada, tentando reconectar...');
            setTimeout(() => conectarWebSocket(linha, pontosDeParada), 5000);
        });

        socket.on('error', (err) => {
            clearInterval(pingInterval);
            console.error('Erro na conexão WebSocket:', err.message);
            socket.close();
        });
    });

    socket.on('message', (data) => {
        const message = data.toString();
        if (message.startsWith('42/mapasinotico,')) {
            const jsonString = message.slice('42/mapasinotico,'.length);
            try {
                const parsedData = JSON.parse(jsonString);
                if (Array.isArray(parsedData) && parsedData.length >= 2 &&
                    (parsedData[0] === 'sync' || parsedData[0] === 'update' || parsedData[0] === 'insert')) {

                    const veiculos = parsedData[1]?.data;
                    if (veiculos && Array.isArray(veiculos)) {
                        veiculos.forEach(veiculo => {
                            const { gpsAnterior, consorcio, dataTransmissaoS, pontoMaisProximo } = veiculo;
                            console.log(`Veículo atualizado: ${JSON.stringify({ gpsAnterior, consorcio, dataTransmissaoS, pontoMaisProximo })}`);
                        });
                    }
                }
            } catch (err) {
                console.error('Erro ao processar mensagem WebSocket:', err.message);
            }
        } else if (message === '3') {
            console.log('Recebido pong do servidor');
        }
    });
}

async function iniciarMonitoramento(linha) {
    const pontosUrl = 'https://zn5.sinopticoplus.com/api/mapaExterno/linha/1170/pontos/565f12fd08b8148e31179aad';
    const pontosDeParada = await obterPontosDeParada(pontosUrl);
    console.log('Pontos de parada obtidos:', pontosDeParada.map(p => p.nome));
    conectarWebSocket(linha, pontosDeParada);
}

// Exemplo de chamada da função
iniciarMonitoramento('608');
