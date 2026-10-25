# 🔁 Repeat Loop Player - Reprodutor Contínuo de Áudio e Vídeo

> **Repeat Loop Player** é uma aplicação web progressiva (PWA) moderna, rápida e visualmente deslumbrante, projetada especificamente para **reprodução contínua e repetitiva em loop infinito** de vídeos e áudios locais ou remotos, com controle de **checkpoints por mídia** e repetição de **trechos específicos (Loop A-B)**.

![Status](https://img.shields.io/badge/Status-100%25%20Funcional-10b981?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Instal%C3%A1vel-6366f1?style=for-the-badge)
![Design](https://img.shields.io/badge/UI-Dark%20Glassmorphism-a855f7?style=for-the-badge)

---

## 🎯 Casos de Uso Ideais

* 🎸 **Música e Instrumentos:** Pratique um solo de guitarra, sequência de acordes ou trecho musical repetindo o mesmo segmento sem parar.
* 💃 **Dança e Coreografia:** Treine passos complexos de vídeo em velocidade normal ou reduzida (0.5x, 0.75x) repetindo apenas os segundos necessários.
* 🗣️ **Estudo de Idiomas e Transcrição:** Repita diálogos, pronúncias difíceis e frases até fixar o aprendizado.
* 📺 **Vitrines, Telões e Apresentações:** Deixe vídeos promocionais ou animações institucionais rodando em ciclo contínuo sem interrupções.
* 🧘 **Foco, Relaxamento e Sono:** Toque faixas de ruído branco, chuva, meditação ou trilhas Lo-Fi em loop infinito.

---

## ✨ Principais Funcionalidades

### 1. 🔁 Repetição Infinita Inteligente (Master Loop)
* **Modo Contínuo:** Quando ativado, o player nunca para ao final de um arquivo; ele avança automaticamente para o próximo item selecionado ou repete a própria mídia em ciclo permanente.
* **Contador de Voltas:** Exibe em tempo real quantas vezes cada mídia já foi repetida durante a sessão.

### 2. 📍 Sistema de Checkpoints por Mídia
* Cada mídia na fila possui uma caixa de seleção rápida (**Checkpoint**).
* **Controle Total do Ciclo:** Somente as mídias com o checkpoint marcado (✓) participam da rotação contínua. Mídias desmarcadas são puladas automaticamente no ciclo, permitindo filtrar o que você quer repetir sem precisar apagar os arquivos da lista.
* Botão para **Marcar / Desmarcar Todos** os checkpoints de uma só vez.

### 3. ⏱️ Checkpoint de Trecho Específico (Loop A-B)
* **Defina Ponto A (Início)** e **Ponto B (Fim)** com precisão de milissegundos enquanto assiste ou ouve.
* Marcadores visuais coloridos e interativos diretamente na linha do tempo (*timeline*).
* Ao atingir o Ponto B, o reprodutor salta instantaneamente de volta para o Ponto A de forma suave.
* Botão de ativação/desativação rápida e botão de reset para limpar os marcadores quando desejar.

### 4. 📁 Importação Flexível e Imediata
* **Carregamento Instantâneo:** Ao adicionar arquivos, o reprodutor inicia a primeira mídia adicionada imediatamente.
* **Formatos Suportados:**
  * **Vídeos:** MP4, WebM, MKV, MOV, AVI, WMV, M4V, FLV, TS, 3GP, etc.
  * **Áudios:** MP3, WAV, OGG, FLAC, AAC, M4A, OPUS, WMA, etc.
* **Arrastar e Soltar (Drag & Drop):** Arraste seus arquivos do Windows e solte diretamente no **palco do vídeo** ou na **área da lista**.
* **Adicionar por Link/URL:** Insira links diretos de arquivos de mídia da internet.
* **Amostras Integradas (Demos):** Botão para carregar amostras de alta definição com URLs públicas verificadas e ativas.

### 5. 🎨 Palco Dinâmico e Visualizador de Áudio
* **Alternância Automática:** Se o arquivo for vídeo, exibe o reprodutor de vídeo em tela cheia; se for música/áudio, ativa um **visualizador de espectro sonoro reativo em Canvas (Web Audio API)** com disco estilizado giratório.
* **Clique no Vídeo para Play/Pause:** Toque ou clique em qualquer lugar da tela do vídeo para pausar ou continuar, acompanhado de animação de pulso central (▶ / ⏸).

### 6. 🎛️ Controles de Reprodução Avançados
* **Velocidade Variável:** Ajuste a velocidade para **0.5x, 0.75x, 1.0x (Normal), 1.25x, 1.5x e 2.0x**.
* **Picture-in-Picture (PiP):** Assista aos vídeos em uma janela flutuante enquanto utiliza outros programas ou navega no computador.
* **Tela Cheia (Fullscreen):** Modo imersivo para visualização limpa.
* **💡 Tela Ativa (Screen Wake Lock API):** Impede que a tela do computador ou celular apague ou entre em suspensão durante a reprodução.
* **Controle de Volume e Mute Rápido:** Ajuste por barra deslizante ou clique no ícone para silenciar.

### 7. 📲 Integração com Sistema Operacional e PWA
* **Media Session API:** Exibe o título, arte do logo e botões de controle multimídia (Play, Pause, Anterior, Próximo, Buscar) na tela de bloqueio e na central de controle do Windows, Android e iOS.
* **PWA Instalável:** Pode ser instalado como aplicativo nativo no computador ou smartphone, funcionando offline.

---

## ⌨️ Atalhos de Teclado

Para máxima produtividade, você pode controlar o player usando o teclado:

| Tecla | Ação |
| :--- | :--- |
| <kbd>Espaço</kbd> | Reproduzir / Pausar a mídia atual |
| <kbd>&rarr;</kbd> *(Seta Direita)* | Avançar **5 segundos** |
| <kbd>&larr;</kbd> *(Seta Esquerda)* | Retroceder **5 segundos** |
| <kbd>R</kbd> | Alternar modo de **Repetição Infinita** (Ligar / Desligar) |

---

## 🚀 Como Executar o Projeto

Como o Repeat Loop Player é construído com tecnologias web puras (Vanilla HTML, CSS e JavaScript), ele não requer compilações complexas ou instalação de pacotes pesados.

### Opção 1: Via Live Server (Extensão do VS Code) - Recomendado
1. Abra a pasta do projeto no **VS Code**.
2. Clique com o botão direito sobre o arquivo [`index.html`](file:///c:/Meus%20Projetos/outros%20projetos/Reprodutor%20continuo%20de%20audio%20e%20video/index.html).
3. Selecione **"Open with Live Server"**.
4. O aplicativo abrirá automaticamente no seu navegador padrão no endereço `http://127.0.0.1:5500`.

### Opção 2: Servidor Local via Node.js
No terminal dentro da pasta do projeto:
```bash
npx serve .
```

### Opção 3: Servidor Local via Python
```bash
# Python 3
python -m http.server 8080
```
Em seguida, abra `http://localhost:8080` no navegador.

---

## 📂 Estrutura de Arquivos

```
Reprodutor continuo de audio e video/
│
├── index.html       # Estrutura semântica da aplicação, palcos, modais e controles
├── style.css        # Sistema de design Dark Glassmorphism, animações e responsividade
├── app.js           # Lógica central: ciclo de repetição, checkpoints A-B, Web Audio API
├── icon.svg         # Ícone oficial vetorial de alta resolução com design 'Repeat'
├── manifest.json    # Metadados de instalação PWA (Progressive Web App)
├── sw.js            # Service Worker para suporte offline e estratégia Network-First
└── README.md        # Documentação completa do projeto
```

---

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Elementos semânticos, `<video>` e `<audio>` nativos com aceleração por hardware.
* **CSS3:** Variáveis customizadas (*Design Tokens*), layout em CSS Grid e Flexbox, efeito *Glassmorphism*, gradientes lineares e radiais e animações de micro-interação.
* **JavaScript Moderno (ES6+):** Programação orientada a objetos com gerenciamento de estado desacoplado.
* **Web Audio API:** Extração de frequências sonoras em tempo real para o espectrograma.
* **HTML5 Canvas:** Renderização gráfica a 60 FPS do espectro de áudio.
* **Screen Wake Lock API:** Prevenção de bloqueio de tela em execuções contínuas.
* **Media Session API:** Comunicação com os controles de hardware do sistema operacional.
* **Service Workers & Cache Storage:** Suporte a execução offline e instalação em tela inicial.

---

## 💡 Dicas de Uso

1. **Formatos de Vídeo Recomendados:** Os navegadores web modernos possuem suporte nativo ideal para **MP4 (codec H.264)** e **WebM (codec VP9/AV1)**. Caso um arquivo de extensão MKV ou AVI possua codecs não suportados pelo navegador, o aplicativo exibirá um alerta na tela indicando a necessidade do formato MP4/WebM.
2. **Atualização Rápida no Live Server:** Sempre que fizer alterações manuais em arquivos, você pode pressionar <kbd>Ctrl</kbd> + <kbd>F5</kbd> para garantir que o navegador recarregue o Service Worker sem cache residual.
