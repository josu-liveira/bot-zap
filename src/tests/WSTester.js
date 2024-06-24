
/*/ ATÉ ENTÃO, ESTÁ É A MELHOR VERSÃO DO CONSULTA ONIBUS.

AQUI FOI IMPLEMENTADO:

* Filtro de garagem
* Otimização de código
* Não era necessário manter a conexão com o WebSocket (Pelo menos até agora XDDD)
* Use esse código como base em suas implementações

NÃO TENTE MODIFICAR, SENÃO NÃO VAI FUNCIONAR. NEM SEI COMO ESSA POHA TA FUNCIONANDO TÃO RÁPIDO COMPARADO A UM CÓDIGO TODO ESTRUTURADO
E CHEIO DE FUNÇÕES OTIMIZADAS KKKKK

/*/
const WebSocket = require('ws');

function consultarLinhas(req, linha) {
    return new Promise((resolve, reject) => {
        const wsUrl = 'wss://websocket2.zn5.m2mcontrol.com.br/socket.io/?clienteId=1170&subs=_&EIO=3&transport=websocket';
        const socket = new WebSocket(wsUrl);
        const linhaOnibus = linha;
        let onibusDesligados = 0;

        socket.on('open', () => {
            console.log(`Linha ${linhaOnibus} consultada`);
            // Enviando mensagens após a conexão ser estabelecida
            socket.send('40/mapasinotico');
            socket.send('42/mapasinotico,["setupSubs",["_"]]')
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
                            const { sinotico, pontoMaisProximo, velocidadeAtual, prefixoVeiculo } = veiculo;

                            if (sinotico !== "undefined") {
                                const { nomeLinha } = sinotico;
                                const retornoNome = nomeLinha;
                                infoLinha = `*ONIBUS ATIVOS NESTE MOMENTO NA LINHA ${retornoNome}*\n\n`;
                            }

                            if (sinotico && pontoMaisProximo && velocidadeAtual !== "undefined" && prefixoVeiculo) {
                                // Filtragem de ônibus desligados
                                if (pontoMaisProximo.startsWith('Integra') || pontoMaisProximo.startsWith('PONTO INTEGRA') || pontoMaisProximo.startsWith('GARAGEM EXPRESSO NS') || pontoMaisProximo.startsWith('Garagem Pantanal') || pontoMaisProximo.startsWith('Garagem Vpar') || pontoMaisProximo.startsWith("Garagem Uni") || pontoMaisProximo.startsWith("Posto 13")) {
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

                        const resultadoFinal = infoLinha + mensagens + `Ônibus desligados: ${onibusDesligados}`;
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

consultarLinhas('42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aaf:565f12fd08b8148e31179aae:*"]]', '605')
    .then(resultadoFinal => {
        console.log(resultadoFinal);
    })
    .catch(err => {
        console.error('Erro ao consultar linha:', err);
    });
