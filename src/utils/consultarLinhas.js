const WebSocket = require('ws');

function consultarLinhas(req, linha) {
    return new Promise((resolve, reject) => {
        const wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        const socket = new WebSocket(wsUrl);
        const linhaOnibus = linha;
        let onibusDesligados = 0;

        socket.on('open', () => {
            console.log(`Linha ${linhaOnibus} consultada`);
            socket.send('40/mapasinotico');
            socket.send('42/mapasinotico,["setupSubs",["_"]]');
            const valor = req;
            socket.send(valor);
        });

        socket.on('message', (data) => {
            const message = data.toString();
            if (message.startsWith('42/mapasinotico,')) {
                const jsonString = message.slice('42/mapasinotico,'.length);
                try {
                    const parsedData = JSON.parse(jsonString);

                    if (Array.isArray(parsedData) && parsedData.length >= 2 &&
                        (parsedData[0] === 'sync' || parsedData[0] === 'update')) {

                        const veiculos = parsedData[1]?.data;
                        if (veiculos && Array.isArray(veiculos)) {
                            let infoLinha = '';
                            let mensagens = '';

                            veiculos.forEach(veiculo => {
                                const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo } = veiculo;

                                if (sinotico !== "undefined") {
                                    const { nomeLinha } = sinotico;
                                    const retornoNome = nomeLinha;
                                    infoLinha = `*ONIBUS ATIVOS NESTE MOMENTO NA LINHA ${retornoNome}*\n\n`;
                                }

                                if (sinotico && pontoMaisProximo && velocidadeAtual !== "undefined" && prefixoVeiculo) {
                                    if (pontoMaisProximo.startsWith('Integra') || pontoMaisProximo.startsWith('PONTO INTEGRA') || pontoMaisProximo.startsWith('GARAGEM EXPRESSO NS') || pontoMaisProximo.startsWith('Garagem Pantanal') || pontoMaisProximo.startsWith('Garagem Vpar') || pontoMaisProximo.startsWith("Garagem Uni") || pontoMaisProximo.startsWith("Posto 13") || pontoMaisProximo.startsWith("TUT TRANSPORTE")) 
                                        {
                                            
                                        onibusDesligados++;
                                    } else {
                                        const { nomeTrajeto } = sinotico;
                                        const { previsaoChegada } = sinotico;
                                        const { pontoInteresseFinal } = sinotico;
                                        const mensagem = `🚌 Carro: ${prefixoVeiculo}\n⚠️ Sentido: ${nomeTrajeto}\n🛣️ Destino: ${pontoInteresseFinal}\n📍 Próximo à: ${pontoMaisProximo}\n🛞 Velocidade: ${velocidadeAtual} Km/h\n🕓 Chega ao destino em: ${previsaoChegada}\n\n`;
                                        mensagens += mensagem;
                                    }
                                }
                            });

                            const resultadoFinal = infoLinha + mensagens + `Atualmente, existem *${onibusDesligados}* ônibus na garagem.`;
                            //console.log("Resultado Final:", resultadoFinal); // Adiciona um log aqui
                            resolve(resultadoFinal);
                        } else {
                            resolve('Nenhum veículo encontrado.');
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            }
        });

        socket.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = consultarLinhas;
