# Projeto bot-zap - Um simples chatbot WhatsApp

## Documentação
Acesse a documentação [aqui](https://josu-liveira.github.io/bot-zap/)

#

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

*Exemplo de código que envia um "Olá Mundo!" quando receber um "Oi";*


