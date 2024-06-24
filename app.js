const { 
    default: makeWASocket, makeInMemoryStore, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion, DisconnectReason 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const os = require('os');
const translate = require('@iamtraction/google-translate');
const pidusage = require ('pidusage');

const { handleOnibusMenu } = require('./src/menus/onibus');
const { handleInteracoesMenu } = require('./src/menus/interacoes');
const { enviarMensagemTexto, enviarImagem, enviarVideo, enviarPDF } = require('./src/utils/funcaoMenasgens');

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
        return x === true ? 'Sim' : 'Não';
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
    let lerMensagensProprias = true;
    let responderIndividuais = true;
    const gruposPermitidos = ['Los Buxas']; // Lista de nomes dos grupos permitidos

    // Variável para rastrear submenu ativo
    let menuOnibus = null;
    let menuIntera = null;
    let aguardandoTextoParaTraducao = false;

    // Função de delay para as mensagens
    function delay(t) {
        return new Promise(resolve => setTimeout(resolve, t));
    }

    // Função para verificar se deve responder com base nas variáveis de controle
    async function deveResponder(mensagem) {
        const jid = mensagem.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const fromMe = mensagem.key.fromMe;

        if (!lerMensagensProprias && fromMe) {
            return false;
        }

        if (isGroup) {
            const groupMetadata = await client.groupMetadata(jid);
            const groupName = groupMetadata.subject;

            if (!gruposPermitidos.includes(groupName)) {
                return false;
            }
            return true;
        }

        if (!isGroup && responderIndividuais) {
            return true;
        }

        return false;
    }

    async function obterEstatisticas() {
        const uptime = process.uptime();
        const memoriaLivre = os.freemem();
        const memoriaTotal = os.totalmem();
        const memoriaUso = memoriaTotal - memoriaLivre;
        const latencia = Date.now() - client?.ws?.ping;
        const tipoConexao = client?.ws?.isOpen ? 'Conectado' : 'Desconectado';

        const stats = await pidusage(process.pid);

        const memoriaUsoMB = (memoriaUso / 1024 / 1024).toFixed(2);
        const memoriaTotalMB = (memoriaTotal / 1024 / 1024).toFixed(2);
        const memoriaLivreMB = (memoriaLivre / 1024 / 1024).toFixed(2);

        return `*⚙️ - STATUS DO SERVIDOR - ⚙️*\n\n` +
            `*Estado:* ${tipoConexao}\n` +
            `*Uso Memória:* ${memoriaUsoMB} MB\n` +
            `*Mem Livre:* ${memoriaLivreMB} MB\n` +
            `*Mem Total:* ${memoriaTotalMB} MB\n` +
            `*Temp Exec:* ${Math.floor(uptime / 60)} minutos\n` +
            `*Uso CPU:* ${stats.cpu.toFixed(2)}%\n` +
            `*Uso Mem Process:* ${(stats.memory / 1024 / 1024).toFixed(2)} MB\n`;
    }

    // Monitorar mensagens recebidas
    client.ev.on('messages.upsert', async (msg) => {
        const mensagem = msg.messages[0];
        if (!mensagem.message) return;

        const jid = mensagem.key.remoteJid;
        const nomeContato = mensagem.pushName || 'usuário';

        const texto = mensagem.message.conversation || mensagem.message.extendedTextMessage?.text || '';

        // Verifica se deve responder a mensagem
        const deveResp = await deveResponder(mensagem);
        if (!deveResp) {
            return;
        }

        // Capturar texto para tradução
        if (aguardandoTextoParaTraducao && !texto.startsWith('!')) {
            aguardandoTextoParaTraducao = false;
            translate(texto, { from: 'pt', to: 'en' }).then(res => {
                enviarMensagemTexto(client, jid, `Tradução: ${res.text}`);
            }).catch(err => {
                enviarMensagemTexto(client, jid, `Erro na tradução: ${err.message}`);
            });
            return;
        }

        // Verifica se a mensagem começa com "!"
        if (texto.startsWith('!')) {
            const comando = texto.slice(1).trim();

            // Submenu "Verificar ônibus em tempo real"
            if (menuOnibus === 'verificarOnibus') {
                await handleOnibusMenu(client, jid, comando);
                menuOnibus = null;
                return;
            }

            // Submenu "Verificar interações"
            if (menuIntera === 'verificarInteracoes') {
                await handleInteracoesMenu(client, jid, comando, nomeContato);
                menuIntera = null;
                return;
            }

            // Comandos principais
            if (comando === 's') {
                const mensagemInicial = `Olá, *${nomeContato}*! você iniciou o bot v1.4!\n\nPor favor, aguarde, já irei te responder!`;
                const mensagemSeguinte = `Está perdido *${nomeContato}*? Use *!cmds* para acessar a lista de comandos!`;

                await enviarMensagemTexto(client, jid, mensagemInicial);
                await delay(2000); // Delay de 2 segundos
                await enviarMensagemTexto(client, jid, mensagemSeguinte);
            } 
            
            else if (comando === 'cmds') {
                const listaComandos = '*Funcionalidades:*\n\n*[ !bus ]* - Verifique onde seu ônibus está. *Tudo em tempo real!*\r\n*[ !tdz ]* - Traduza um texto para Inglês\r\n\r\n*Entreterimento:*\n\n*[ 1 ]* - Interações\n[ 2 ] - Biblioteca'
                await enviarMensagemTexto(client, jid, listaComandos);
            } 
            
            else if (comando === '1') {
                menuIntera = 'verificarInteracoes';
                const menuIntMsg = '*MENU DE INTERAÇÕES*\n\n*[ 1 ]* - Dizer bom dia\r\n*[ 2 ]* - Acessar o GitHub do meu criador\r\n*[ 3 ]* - 😏';
                await enviarMensagemTexto(client, jid, menuIntMsg);
            }
            
            else if (comando === '8') {
                const nome = 'Algebra Linear - Plano de Estudos';
                const caminho = './media/Álgebra Linear.pdf';
                const legenda = 'Aqui está seu plano de estudos';
                await enviarPDF(client, jid, caminho, nome, legenda);
            } 
            
            else if (comando === 'bus') {
                menuOnibus = 'verificarOnibus';
                const mensagemSubmenu = '*Consulta ônibus Cuiabá v1.9*\n*Status:* CONECTADO\n\n*Selecione uma linha:*\n\n*[ 608 ]* - Pq. Residencial\n*[ 605 ]* - STA Terezinha\n*[ 103 ]* - UFMT\n*[ C01 ]* - UFMT\n*[ 119 ]* - Sta. Isabel\n*[ 007 ]* - Ponte Nova\n*[ 022 ] - Jaime Campos / VG*';
                await enviarMensagemTexto(client, jid, mensagemSubmenu);
            } 
            
            else if (comando === 'tdz') {
                aguardandoTextoParaTraducao = true;
                await enviarMensagemTexto(client, jid, "Digite o texto que deseja traduzir:");
            } 
            
            else if (comando === 'stats') {
                const stats = await obterEstatisticas();
                await enviarMensagemTexto(client, jid, stats);
            }

            else {
                await enviarMensagemTexto(client, jid, `Comando inválido! Digite !cmds para ver a lista de comandos`);
            }
        }
    });

    console.log('Inicializando...');
}

ligarbot();