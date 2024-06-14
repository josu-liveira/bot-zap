const WebSocket = require('ws');

function consultarLinhas(req, linha) {
    return new Promise((resolve, reject) => {
        const wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        const socket = new WebSocket(wsUrl);
        const linhaOnibus = linha;

        socket.on('open', () => {
            console.log(`Linha ${linhaOnibus} consultada`);
            // Enviando mensagens após a conexão ser estabelecida
            socket.send('40/mapasinotico');
            const valor = req;
            socket.send(valor);
        });

        socket.on('message', (data) => {
            const message = data.toString();
            // Verifica se a mensagem começa com "42" e possui o prefixo correto
            if (message.startsWith('42/mapasinotico,')) {
                const jsonString = message.slice('42/mapasinotico,'.length);
                const parsedData = JSON.parse(jsonString);

                // Verifica se o array tem pelo menos dois elementos e se o primeiro é "sync" ou "update"
                if (Array.isArray(parsedData) && parsedData.length >= 2 &&
                    (parsedData[0] === 'sync' || parsedData[0] === 'update')) {

                    const veiculos = parsedData[1]?.data; // Verifica se parsedData[1] e parsedData[1].data existem
                    if (veiculos && Array.isArray(veiculos)) {
                        let infoLinha = '';
                        let mensagens = '';

                        veiculos.forEach(veiculo => {
                            const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo, motorista } = veiculo;

                            if (sinotico !== "undefined") {
                                const { nomeLinha } = sinotico;
                                const retornoNome = nomeLinha;
                                infoLinha = `*ONIBUS ATIVOS NESTE MOMENTO NA LINHA ${retornoNome}*\n\n`;
                            }

                            if (sinotico && motorista && pontoMaisProximo && velocidadeAtual !== "undefined" && prefixoVeiculo) {
                                const { nomeTrajeto } = sinotico;
                                const { previsaoChegada } = sinotico;
                                const { pontoInteresseFinal } = sinotico;
                                const nomeMotorista = motorista ? motorista.nome : 'Não especificado';
                                const mensagem = `📢 Linha: ${nomeTrajeto}\n➡️ Sentido: ${pontoInteresseFinal}\n📍 Próximo à: ${pontoMaisProximo}\n🛞 Velocidade: ${velocidadeAtual} Km/h\n🚌 Carro: ${prefixoVeiculo}\n👨🏽‍🦳 Motorista: ${nomeMotorista}\n🕓 Previsão de chegada: ${previsaoChegada}\n\n`;
                                mensagens += mensagem;
                            }
                        });

                        const resultadoFinal = infoLinha + mensagens;
                        resolve(resultadoFinal);
                    }
                }
            }
        });

        socket.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = consultarLinhas;