const WebSocket = require('ws');

function consultarLinhas(req, linha) {
    return new Promise((resolve, reject) => {
        const wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        const socket = new WebSocket(wsUrl);
        const linhaOnibus = linha;

        console.log(`Iniciando consulta para a linha ${linhaOnibus}`);

        socket.on('open', () => {
            console.log(`Conexão estabelecida para a linha ${linhaOnibus}`);
            socket.send('40/mapasinotico');
            socket.send(req);
            console.log(`Mensagens enviadas: '40/mapasinotico' e '${req}'`);
        });

        socket.on('message', (data) => {
            try {
                const message = Buffer.from(data).toString('utf8');
                console.log(`Mensagem recebida: ${message}`);

                if (message.startsWith('42/mapasinotico,')) {
                    const jsonString = message.slice('42/mapasinotico,'.length);
                    const parsedData = JSON.parse(jsonString);
                    console.log('Dados recebidos e convertidos:', parsedData);

                    if (Array.isArray(parsedData) && parsedData.length >= 2 &&
                        (parsedData[0] === 'sync' || parsedData[0] === 'update')) {

                        const veiculos = parsedData[1]?.data;
                        if (veiculos && Array.isArray(veiculos)) {
                            console.log('Processando veículos...');
                            const resultadoFinal = processarVeiculos(veiculos);
                            console.log('Resultado final:', resultadoFinal);
                            resolve(resultadoFinal);
                            socket.close();
                        }
                    }
                }
            } catch (err) {
                console.error('Erro ao processar a mensagem:', err);
                reject(err);
                socket.close();
            }
        });

        socket.on('error', (err) => {
            console.error('Erro no WebSocket:', err);
            reject(err);
        });
    });
}

function processarVeiculos(veiculos) {
    let infoLinha = '';
    let mensagens = '';
    let onibusInativos = 0;

    veiculos.forEach(veiculo => {
        const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo } = veiculo;

        if (sinotico && sinotico.nomeLinha) {
            const { nomeLinha } = sinotico;
            infoLinha = `*ONIBUS ATIVOS NESTE MOMENTO NA LINHA ${nomeLinha}*\n\n`;
        }

        if (sinotico && pontoMaisProximo && velocidadeAtual && prefixoVeiculo) {
            const pontoCorrigido = Buffer.from(pontoMaisProximo, 'utf8').toString();

            if (pontoCorrigido === 'Integração Transporte' || pontoCorrigido === 'PONTO INTEGRAÇÃO IDA') {
                onibusInativos++;
                console.log(`Ônibus inativo encontrado: ${prefixoVeiculo} próximo a ${pontoCorrigido}`);
            } else {
                const { nomeTrajeto, previsaoChegada, pontoInteresseFinal } = sinotico;
                const mensagem = `🚌 Carro: ${prefixoVeiculo}\n⚠️ Sentido: ${nomeTrajeto}\n🛣️ Destino: ${pontoInteresseFinal}\n📍 Próximo à: ${pontoCorrigido}\n🛞 Velocidade: ${velocidadeAtual} Km/h\n🕓 Chega ao destino em: ${previsaoChegada}\n\n`;
                mensagens += mensagem;
                console.log(`Ônibus ativo: ${mensagem}`);
            }
        }
    });

    if (onibusInativos > 0) {
        mensagens += `\nÔnibus inativos no momento: ${onibusInativos}`;
    }

    return infoLinha + mensagens;
}

module.exports = consultarLinhas;
