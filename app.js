const { 
    default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion, DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const consultarLinhas = require('./src/funcoes/consultarLinhas');

async function ligarbot() {
    // Logger
    const store = makeInMemoryStore({ logger: pino().child({ level: 'debug', stream: 'store' }) });
    store.readFromFile('./baileys_store.json');
    setInterval(() => {
        store.writeToFile('./baileys_store.json');
    }, 10_000);

    // Salvar credenciais
    const { state, saveCreds } = await useMultiFileAuthState('./src/auth');

    // Verificar a última versão do Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();

    function simnao(x) {
        if (x === true) {
            return 'Sim';
        } else {
            return 'Não';
        }
    }

    const teste = simnao(isLatest);

    console.log('#######################################\n\n---------- JOSUÉ BOT V. 1.4 -----------\n\n#######################################');
    console.log(`\nVersão Baileys: ${version} - Atualizada: ${teste}`);

    // Configurações iniciais do socket
    const client = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        qrTimeout: 180000,
        browser: Browsers.macOS('Desktop'),
        auth: state,
        syncFullHistory: true
    });

    client.ev.on('creds.update', saveCreds);
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada! Causa: ', lastDisconnect.error, ', reconectando... ', shouldReconnect);
            if (shouldReconnect) {
                ligarbot();
            }
        } else if (connection === 'open') {
            console.log('Conexão estabelecida');
        }
    });

    // Variáveis de controle
    let responderATodos = false;
    let responderGrupos = true;
    let responderIndividuais = true;
    let responderReacoes = false;
    let lerGruposEspecificos = true;
    let lerMensagensProprias = true;
    const gruposPermitidos = ['Sociedade Unida UFMT - UNIC', 'bot_josue_grp']; // Lista de nomes dos grupos permitidos

    // Variável para rastrear submenu ativo
    let submenuAtivo = null;

    // Função de delay para as mensagens
    function delay(t) {
        return new Promise(resolve => setTimeout(resolve, t));
    }

    // Função para enviar mensagens de texto
    async function enviarMensagemTexto(jid, texto) {
        await client.sendMessage(jid, { text: texto });
    }

    // Função para enviar imagens
    async function enviarImagem(jid, caminho, legenda = '') {
        const buffer = fs.readFileSync(caminho);
        await client.sendMessage(jid, { image: buffer, caption: legenda });
    }

    // Função para enviar vídeos
    async function enviarVideo(jid, caminho, legenda = '') {
        const buffer = fs.readFileSync(caminho);
        await client.sendMessage(jid, { video: buffer, caption: legenda });
    }

    // Função para enviar PDFs
    async function enviarPDF(jid, caminho, nome = '', legenda = '') {
        const buffer = fs.readFileSync(caminho);
        await client.sendMessage(jid, { document: buffer, caption: legenda, fileName: nome, mimetype: 'application/pdf' });
    }

    // Função para verificar se deve responder com base nas variáveis de controle
    function deveResponder(mensagem) {
        const jid = mensagem.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const isReaction = mensagem.message?.reactionMessage ? true : false;
        const fromMe = mensagem.key.fromMe;
        const groupName = mensagem.pushName;

        if (!lerMensagensProprias && fromMe) {
            return false;
        }

        if (lerGruposEspecificos && isGroup) {
            if (!gruposPermitidos.includes(groupName)) {
                return false;
            }
        }

        if (responderATodos) {
            return true;
        }

        if (responderGrupos && isGroup) {
            return true;
        }

        if (responderIndividuais && !isGroup) {
            return true;
        }

        if (responderReacoes && isReaction) {
            return true;
        }

        return false;
    }

    // Monitorar mensagens recebidas
    client.ev.on('messages.upsert', async (msg) => {
        const mensagem = msg.messages[0];
        if (!mensagem.message) return;

        const jid = mensagem.key.remoteJid;
        const nomeContato = mensagem.pushName || 'usuário';

        const texto = mensagem.message.conversation || mensagem.message.extendedTextMessage?.text || '';

        // Verifica se deve responder a mensagem
        if (!deveResponder(mensagem)) {
            return;
        }

        // Verifica se a mensagem começa com "!"
        if (texto.startsWith('!')) {
            const comando = texto.slice(1).trim();

            if (submenuAtivo === 'verificarOnibus') {
                // Submenu "Verificar ônibus em tempo real"
                
                if (comando === '608') {            
                    consultarLinhas('42/mapasinotico,["setupSubs",["565f12fd08b8148e31179aaf:565f12fd08b8148e31179aad:*","565f12fd08b8148e31179aae:*"]]', '608')
                    .then(resultadoFinal => { 
                    enviarMensagemTexto(jid, resultadoFinal)
                    })
                }  

                if (comando === '103') {            
                    consultarLinhas('42/mapasinotico,["setupSubs",["59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a07:*","59cbc20bf6b530f002e57a09:59cbc20bf6b530f002e57a08:*"]]', '103')
                    .then(resultadoFinal => { 
                    enviarMensagemTexto(jid, resultadoFinal)
                    })
                }  

                if (comando === '119') {            
                    consultarLinhas('42/mapasinotico,["setupSubs",["61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e0:*","61250f649eeb9b4b105445e2:61250f649eeb9b4b105445e1:*"]]', '119')
                    .then(resultadoFinal => { 
                    enviarMensagemTexto(jid, resultadoFinal)
                    })
                }  

                if (comando === '007') {            
                    consultarLinhas('42/mapasinotico,["setupSubs",["56f04f8b298843ac7b7e2184:56f04f8b298843ac7b7e2182:*","56f04f8b298843ac7b7e2184:56f04f8b298843ac7b7e2183:*"]]', '007')
                    .then(resultadoFinal => { 
                    enviarMensagemTexto(jid, resultadoFinal)
                    })
                }  

                // Reiniciar o submenuAtivo após o uso
                submenuAtivo = null;

            } 
            
            else {
                // Comandos principais
                if (comando === 's') {
                    const mensagemInicial = `Olá, *${nomeContato}*! você iniciou o bot v1.4!\n\nPor favor, aguarde, já irei te responder!`;
                    const mensagemSeguinte = `Está perdido *${nomeContato}*? Use *!cmds* para acessar a lista de comandos!`;

                    await enviarMensagemTexto(jid, mensagemInicial);
                    await delay(2000); // Delay de 2 segundos
                    await enviarMensagemTexto(jid, mensagemSeguinte);
                } 
                
                else if (comando === 'cmds') {
                    const listaComandos = '*LISTA DE COMANDOS:*\n\n*[ imgs ]* - Solicitar cumprimentos. \r\n*[ 2 ]* - GitHub do meu criador \r\n*[ 3 ]* - Botão da carência \r\n*[ 4 ] - Exibir ManFace* \r\n*[ 5 ]* - Registrar uma sugestão\r\n*[ 6 ]* - Exibir Rick\r\n*[ 7 ]* - CJ falando verdades\r\n*[ 8 ]* - Plano de estudos Algebra Linear\r\n\r\n*[ !bus ]* - Verifique onde seu ônibus está. Tudo em *tempo real!*'
                    await enviarMensagemTexto(jid, listaComandos);
                }

                else if (comando === '1') {
                    const saudacao = `Espero que você tenha um bom dia *${nomeContato}*!`;
                    await enviarMensagemTexto(jid, saudacao);
                } 
                
                else if (comando === '2') {
                    const saudacao = `*${nomeContato}*, veja outros projetos do meu criador! 👇👇👇\n\nhttps://github.com/josu-liveira`;
                    await enviarMensagemTexto(jid, saudacao);
                } 
                
                else if (comando === '3') {
                    const saudacao = `Nossa, *${nomeContato}*! Seu nome é muito bonito.`;
                    await enviarMensagemTexto(jid, saudacao);
                } 
                
                else if (comando === '4') {
                    await enviarImagem(jid, './media/manface.jpg', 'Aqui está sua *Manface* !');
                } 
                
                else if (comando === '5') {
                    const saudacao = `Queira me desculpar *${nomeContato}* 😔, mas essa funcionalidade ainda não existe.`;
                    await enviarMensagemTexto(jid, saudacao);
                } 
                
                else if (comando === '6') {
                    await enviarImagem(jid, './media/rick.jpg', 'Você foi rickrollado!');
                } 
                
                else if (comando === '7') {
                    await enviarVideo(jid, './media/cj.mp4', 'Agora, *Carl Johnson* falará algumas verdades 👆👆👆');
                } 
                
                else if (comando === '8') {
                    const nome = 'Algebra Linear - Plano de Estudos';
                    const caminho = './media/Álgebra Linear.pdf';
                    const legenda = 'Aqui está seu plano de estudos';
                    await enviarPDF(jid, caminho, nome, legenda);
                } 
                
                else if (comando === 'bus') {
                    submenuAtivo = 'verificarOnibus';
                    const mensagemSubmenu = '*🚍 Consulta ônibus Cuiabá v1.9 - beta 🚍*\n*Status WebSocket:* 🟢 200 - CONECTADO\n\n*Selecione uma linha:*\n\n*[ 608 ]* - Pq. Residencial\n*[ 103 ]* - UFMT\n*[ 119 ]* - Sta. Isabel\n*[ 007 ]* - Ponte Nova';
                    await enviarMensagemTexto(jid, mensagemSubmenu);
                }

                else {
                    await enviarMensagemTexto(jid, "Comando inválido! Digite *!cmds* para ver a lista de comandos")
                }
            }
        }
    });

    console.log('Inicializando...');
}

ligarbot();
