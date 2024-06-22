# Projeto bot-zap - Um simples chatbot WhatsApp

## A idéia
Sempre fui fascinado por chatbots. A infinidade de possibilidades e integrações práticas no meio organizacional se beneficiam muito quando se trata de automações. Ideias mais complexas e avançadas exigem a mesma dose de conhecimento em programação, por isso, este projeto está marcando muito minha evolução em desenvolvimento. Conforme estou aprendendo a programar, desenvolvo parte por parte deste projeto. Sem dúvidas, este é meu repositório preferido 🙂.



#### - A escolha da biblioteca/API
Este projeto foi desenvolvido com base na API [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys), escolhida por fornecer uma integração direta com o servidor do WhatsApp através de uma conexão WebSocket. Diferentemente de outras bibliotecas que realizam requisições HTTP por meio de um WebDriver, como Selenium ou Chromium para funcionar, essa abordagem torna a API cerca de 60% mais eficiente.


#### - Vantagens do WebSocket sobre HTTP
Utilizar WebSocket para comunicação em tempo real é mais eficiente em termos de latência e uso de recursos. WebSockets mantêm uma conexão persistente entre o cliente e o servidor, permitindo comunicação bidirecional sem a sobrecarga de abrir novas conexões HTTP repetidamente.


#### - Modularidade e Implementação
A modularidade da API é um ponto importante, pois permite sua implementação em qualquer sistema operacional ou ambiente de servidor. Em meus testes, transformei um smartphone Galaxy A01 em um servidor Linux improvisado, onde implementei um acesso SSH e consegui rodar o código sem problemas, tudo graças a essa incrível API.

**IMPORTANTE:** *Baileys pode ser escrita tanto em JavaScript quanto em TypeScript. Em meu repositório, escreverei as funções em JavaScript.*


#### - Infinitas Possibilidades

Com essa API, praticamente tudo é possível... Desde um simples chatbot até uma integração em tempo real com uma API REST. A capacidade de envio e recebimento de mensagens, arquivos, e até mesmo interações com grupos e status, abre um leque de funcionalidades que podem ser exploradas


#### - Limites de Conteúdo Gratuito
Atualmente, existe pouco conteúdo em pt-BR relacionado a essa API que seja gratuito (principalmente no YouTube). Pensando nisso, tive a iniciativa de criar este repositório, onde estou estudando a documentação da API [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) e re-documentando de uma forma que seu uso seja simples e fácil, possibilitando que uma pessoa que esteja iniciando em programação consiga utilizar essa API tão poderosa.



# Iniciando com Baileys

### - Importação de pacotes

```js
const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
```
Importação de funções básicas das bibliotecas, onde ```@whiskeysockets/baileys``` é responsável pelas funções de conexão com o sock, e ```pino``` captura todos os eventos de atualizações dentro desse sock em JSON.

Este é o código de funcionamento mais básico que existe. Se você instalou tudo corretamente, ele funcionará. Com base nele você pode evoluir as condicionais da forma que quiser.

#

### - Inicio da conexão

```js
async function connectToWhatsApp() {
    const client = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });
```
Aqui, criamos a função assíncrona principal `connectToWhatsApp()`, onde em seu escopo definimos uma variável ```client``` que armazena a função ```makeWASocket()```, que como o próprio nome já diz, realiza a conexão com o WebSocket.

Atente-se a ```printQRInTerminal```, que deve ser definido como ```true```. Isso será responsável por exibir o QR-Code de conexão em seu terminal.

O tipo ```logger``` usa o ```pino``` capturar as atualizações de mensagens. Baileys já tem funções que realizam o parse do JSON recebido, não necessitando de bibliotecas externas.

#

### - Monitoramento da conexão

```js
client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('Conexão fechada! Causa: ', lastDisconnect.error, ', reconectando... ', shouldReconnect);
        if (shouldReconnect) {
            connectToWhatsApp();
        }
    } else if (connection === 'open') {
        console.log('Conexão estabelecida');
    }
});
```
Sabendo que Baileys usa a sintaxe EventEmitter para captura de eventos, o objeto ```connection.update``` é responsável por escutar os eventos de atualização da conexão. Foram adicionadas algumas condicionais para tratar o estado da conexão e exibir no terminal.

#

### - Monitoramento de mensagens

```js
client.ev.on('messages.upsert', async (msg) => {
    const mensagem = msg.messages[0];
    if (!mensagem.message) return;

    const jid = mensagem.key.remoteJid;
    const texto = mensagem.message.conversation || mensagem.message.extendedTextMessage?.text || '';

    if (texto === 'Oi') {
        await client.sendMessage(jid, { text: 'Olá' });
    }
});
```
O evento `messages.upsert` escuta os eventos de novas mensagens recebidas. A variável `jid` obtém o ID do remetente da mensagem. 

A variável `texto` extrai o conteúdo da mensagem. A mensagem pode estar no campo `conversation` ou `extendedTextMessage.text`, dependendo do tipo da mensagem.

A condição `if (texto === 'Oi') { await client.sendMessage(jid, { text: 'Olá' }); }` verifica se o texto contém um texto exatamente igual a "Oi", e se contiver, ela usa a função `sendMessage()` para enviar uma mensagem com um "Olá" para o `jid` que enviou a mensagem.

#

### - Logs
Por fim temos:
```js
	console.log('Inicializando...');  
}  
connectToWhatsApp();
```
`console.log()` exibe no terminal "Inicializando...", caso tudo acima ocorrer como esperado e `connectToWhatsApp()` executa a função assíncrona principal.


## - Código completo
Por fim, nosso código base ficará assim:
```js
const makeWASocket = require('@whiskeysockets/baileys').default;
const { DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function connectToWhatsApp() {
    const client = makeWASocket({
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada! Causa: ', lastDisconnect.error, ', reconectando... ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Conexão estabelecida');
        }
    });

    client.ev.on('messages.upsert', async (msg) => {
        const mensagem = msg.messages[0];
        if (!mensagem.message) return;

        const jid = mensagem.key.remoteJid;
        const texto = mensagem.message.conversation || mensagem.message.extendedTextMessage?.text || '';

        if (texto === 'Oi') {
            await client.sendMessage(jid, { text: 'Olá Mundo!' });
        }
    });

    console.log('Inicializando...');
}

connectToWhatsApp();

```

*Exemplo de código que envia um "Olá Mundo!" quando receber um "Oi";*


