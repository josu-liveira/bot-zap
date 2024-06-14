const WebSocket = require('ws');

async function conectarWebSocket(linha, jid, client, delay, enviarMensagemTexto) {
    let wsUrl, setupSubsMsg;
    if (linha === '608') {
        wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        setupSubsMsg = '42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aaf:565f12fd08b8148e31179aae:*"]]';
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
        console.log(`Linha ${linha} consultada`);
        socket.send('40/mapasinotico');
        socket.send(setupSubsMsg);
    });

    socket.on('message', async (data) => {
        const message = data.toString();
        if (message.startsWith('42/mapasinotico,')) {
            const jsonString = message.slice('42/mapasinotico,'.length);
            const parsedData = JSON.parse(jsonString);
            if (Array.isArray(parsedData) && parsedData.length >= 2 &&
                (parsedData[0] === 'sync' || parsedData[0] === 'update')) {

                const veiculos = parsedData[1]?.data;
                if (veiculos && Array.isArray(veiculos)) {
                    let mensagens = `*ONIBUS ATIVOS NESTE MOMENTO NA LINHA ${linha}:*\n\n`;

                    veiculos.forEach(veiculo => {
                        const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo, motorista} = veiculo;

                        if (sinotico && motorista && pontoMaisProximo && velocidadeAtual !== "undefined" && prefixoVeiculo) {
                            const { nomeTrajeto } = sinotico;
                            const { previsaoChegada } = sinotico;
                            const { pontoInteresseFinal } = sinotico;
                            const nomeMotorista = motorista ? motorista.nome : 'Não especificado';
                            const mensagem = `📢 Linha: ${nomeTrajeto}\n➡️ Sentido: ${pontoInteresseFinal}\n📍 Próximo à: ${pontoMaisProximo}\n🛞 Velocidade: ${velocidadeAtual} Km/h\n🚌 Carro: ${prefixoVeiculo}\n👨🏽‍🦳 Motorista: ${nomeMotorista}\n🕓 Previsão de chegada: ${previsaoChegada}\n\n`;
                            mensagens += mensagem;
                        }
                    });

                    if (mensagens) {
                        await delay(2000);
                        await enviarMensagemTexto(jid, mensagens);
                    }
                }
            }
        }
    });
}

module.exports = conectarWebSocket;
