/**
 * Repeat Loop Player - Reprodutor Contínuo de Áudio e Vídeo com Repetição Infinita
 * e Sistema de Checkpoints (Por Mídia e A-B Segment Loop).
 */

class RepeatLoopPlayerApp {
  constructor() {
    // Estado da Aplicação
    this.playlist = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.9;
    this.playbackRate = 1.0;
    
    // Modos de repetição: 'infinite' (Repetição Infinita Ativa) ou 'off' (Desativada)
    this.repeatMode = 'infinite';
    
    // Contadores
    this.totalLoopsCount = 0;
    this.wakeLockSentinel = null;

    // Elementos DOM
    this.dom = {
      // Elementos de Mídia
      video: document.getElementById('videoElement'),
      audio: document.getElementById('audioElement'),
      canvas: document.getElementById('visualizerCanvas'),
      audioDisc: document.getElementById('audioDisc'),
      audioVisualizerContainer: document.getElementById('audioVisualizerContainer'),
      
      // Badges e Metadados do Palco
      stageContainer: document.getElementById('stageContainer'),
      playerStageCard: document.getElementById('playerStageCard'),
      stageErrorNotice: document.getElementById('stageErrorNotice'),
      stageErrorTitle: document.getElementById('stageErrorTitle'),
      stageErrorDesc: document.getElementById('stageErrorDesc'),
      stageCenterPulse: document.getElementById('stageCenterPulse'),
      centerPulseIcon: document.getElementById('centerPulseIcon'),
      currentTypeBadge: document.getElementById('currentTypeBadge'),
      currentItemLoopBadge: document.getElementById('currentItemLoopBadge'),
      currentItemLoopCount: document.getElementById('currentItemLoopCount'),
      abLoopNotice: document.getElementById('abLoopNotice'),
      abDisplayRange: document.getElementById('abDisplayRange'),
      currentTrackTitle: document.getElementById('currentTrackTitle'),
      currentTrackSource: document.getElementById('currentTrackSource'),
      
      // Linha do tempo
      timelineTrack: document.getElementById('timelineTrack'),
      timelineProgress: document.getElementById('timelineProgress'),
      timelineAbSegment: document.getElementById('timelineAbSegment'),
      markerA: document.getElementById('markerA'),
      markerB: document.getElementById('markerB'),
      timelineSlider: document.getElementById('timelineSlider'),
      currentTimeDisplay: document.getElementById('currentTimeDisplay'),
      totalDurationDisplay: document.getElementById('totalDurationDisplay'),

      // Checkpoint A-B
      toggleAbActive: document.getElementById('toggleAbActive'),
      btnSetPointA: document.getElementById('btnSetPointA'),
      btnSetPointB: document.getElementById('btnSetPointB'),
      btnClearAb: document.getElementById('btnClearAb'),
      valPointA: document.getElementById('valPointA'),
      valPointB: document.getElementById('valPointB'),

      // Controles Mestres
      btnMasterLoop: document.getElementById('btnMasterLoop'),
      masterLoopTitle: document.getElementById('masterLoopTitle'),
      masterLoopDesc: document.getElementById('masterLoopDesc'),
      repeatStatusBadge: document.getElementById('repeatStatusBadge'),
      repeatStatusText: document.getElementById('repeatStatusText'),
      
      // Controles Primários
      btnPrev: document.getElementById('btnPrev'),
      btnPlayPause: document.getElementById('btnPlayPause'),
      iconPlay: document.getElementById('iconPlay'),
      iconPause: document.getElementById('iconPause'),
      btnNext: document.getElementById('btnNext'),

      // Controles Secundários
      btnMute: document.getElementById('btnMute'),
      volumeIcon: document.getElementById('volumeIcon'),
      volumeSlider: document.getElementById('volumeSlider'),
      speedSelect: document.getElementById('speedSelect'),
      btnPip: document.getElementById('btnPip'),
      btnFullscreen: document.getElementById('btnFullscreen'),
      btnWakeLock: document.getElementById('btnWakeLock'),
      btnInstallPwa: document.getElementById('btnInstallPwa'),

      // Playlist
      playlistItemsList: document.getElementById('playlistItemsList'),
      playlistEmptyState: document.getElementById('playlistEmptyState'),
      playlistCountBadge: document.getElementById('playlistCountBadge'),
      btnToggleAllCheckpoints: document.getElementById('btnToggleAllCheckpoints'),
      btnClearPlaylist: document.getElementById('btnClearPlaylist'),
      playlistDropZone: document.getElementById('playlistDropZone'),
      localFileInput: document.getElementById('localFileInput'),
      btnUploadFiles: document.getElementById('btnUploadFiles'),
      btnLoadDemos: document.getElementById('btnLoadDemos'),
      btnOpenUrlModal: document.getElementById('btnOpenUrlModal'),

      // Modal URL
      urlModal: document.getElementById('urlModal'),
      btnCloseUrlModal: document.getElementById('btnCloseUrlModal'),
      btnCancelUrl: document.getElementById('btnCancelUrl'),
      btnSubmitUrl: document.getElementById('btnSubmitUrl'),
      inputMediaUrl: document.getElementById('inputMediaUrl'),
      inputMediaTitle: document.getElementById('inputMediaTitle'),

      // Toasts
      toastContainer: document.getElementById('toastContainer')
    };

    // Áudio Context para Visualizador
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.animationFrameId = null;

    // Inicialização
    this.init();
  }

  init() {
    this.bindEvents();
    this.initPwa();
    this.setupVisualizer();
    this.renderPlaylist();
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */
  bindEvents() {
    // Botão Mestre de Repetição Infinita
    this.dom.btnMasterLoop.addEventListener('click', () => this.toggleMasterLoop());

    // Play / Pause
    this.dom.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    this.dom.btnPrev.addEventListener('click', () => this.playPrevious());
    this.dom.btnNext.addEventListener('click', () => this.playNext());

    // Clique no palco (vídeo/áudio) para Play/Pause rápido
    this.dom.stageContainer.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.badge') || e.target.closest('.stage-overlay-ab') || e.target.closest('.stage-overlay-error')) return;
      this.togglePlayPause();
    });

    // Timeline Scrub
    this.dom.timelineSlider.addEventListener('input', (e) => this.onTimelineScrub(e));

    // Volume & Silenciar
    this.dom.volumeSlider.addEventListener('input', (e) => this.setVolume(parseFloat(e.target.value)));
    this.dom.btnMute.addEventListener('click', () => this.toggleMute());

    // Velocidade
    this.dom.speedSelect.addEventListener('change', (e) => this.setPlaybackRate(parseFloat(e.target.value)));

    // PIP e Tela Cheia
    this.dom.btnPip.addEventListener('click', () => this.togglePictureInPicture());
    this.dom.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Wake Lock (Manter tela ligada)
    this.dom.btnWakeLock.addEventListener('click', () => this.toggleWakeLock());

    // Checkpoint A-B (Segment Loop)
    this.dom.toggleAbActive.addEventListener('change', (e) => this.onToggleAb(e.target.checked));
    this.dom.btnSetPointA.addEventListener('click', () => this.setAbMarker('A'));
    this.dom.btnSetPointB.addEventListener('click', () => this.setAbMarker('B'));
    this.dom.btnClearAb.addEventListener('click', () => this.clearAbMarkers());

    // Playlist Actions
    this.dom.btnToggleAllCheckpoints.addEventListener('click', () => this.toggleAllCheckpoints());
    this.dom.btnClearPlaylist.addEventListener('click', () => this.clearPlaylist());

    // Adicionar Arquivos Locais
    this.dom.btnUploadFiles.addEventListener('click', () => {
      this.dom.localFileInput.value = '';
      this.dom.localFileInput.click();
    });
    this.dom.localFileInput.addEventListener('change', (e) => {
      this.handleLocalFiles(e.target.files);
      e.target.value = '';
    });
    this.dom.btnLoadDemos.addEventListener('click', () => this.loadDemos(true));

    // Modal de URL
    this.dom.btnOpenUrlModal.addEventListener('click', () => this.openUrlModal());
    this.dom.btnCloseUrlModal.addEventListener('click', () => this.closeUrlModal());
    this.dom.btnCancelUrl.addEventListener('click', () => this.closeUrlModal());
    this.dom.btnSubmitUrl.addEventListener('click', () => this.submitUrlModal());

    // Drag and Drop
    this.setupDragAndDrop();

    // Eventos nativos dos elementos de áudio e vídeo
    const mediaElements = [this.dom.audio, this.dom.video];
    mediaElements.forEach((el) => {
      el.addEventListener('timeupdate', () => {
        if (el !== this.getActiveElement()) return;
        this.onTimeUpdate();
      });
      el.addEventListener('loadedmetadata', () => {
        if (el !== this.getActiveElement()) return;
        this.onLoadedMetadata();
      });
      el.addEventListener('ended', () => {
        if (el !== this.getActiveElement()) return;
        this.onMediaEnded();
      });
      el.addEventListener('play', () => {
        if (el !== this.getActiveElement()) return;
        this.onNativePlayState(true);
      });
      el.addEventListener('pause', () => {
        if (el !== this.getActiveElement()) return;
        this.onNativePlayState(false);
      });
      el.addEventListener('error', (e) => {
        if (el !== this.getActiveElement()) return;
        this.onMediaError(el, e);
      });
    });

    // Teclas de atalho convenientes
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.seekRelative(5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekRelative(-5);
      } else if (e.code === 'KeyR') {
        this.toggleMasterLoop();
      }
    });
  }

  /* ==========================================================================
     Player Engine & Mídia Ativa (Áudio ou Vídeo)
     ========================================================================== */
  getActiveElement() {
    const currentItem = this.playlist[this.currentIndex];
    if (!currentItem) return this.dom.audio;
    return currentItem.type === 'video' ? this.dom.video : this.dom.audio;
  }

  getInactiveElement() {
    const currentItem = this.playlist[this.currentIndex];
    if (!currentItem) return this.dom.video;
    return currentItem.type === 'video' ? this.dom.audio : this.dom.video;
  }

  loadItem(index, autoPlay = true) {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentIndex = index;
    const item = this.playlist[index];

    this.hideMediaErrorNotice();

    // Pausa a outra mídia
    this.dom.video.pause();
    this.dom.audio.pause();

    const activeEl = item.type === 'video' ? this.dom.video : this.dom.audio;
    const inactiveEl = item.type === 'video' ? this.dom.audio : this.dom.video;

    // Remove fonte inativa com segurança
    inactiveEl.removeAttribute('src');
    inactiveEl.load();

    // Configura visibilidade do palco
    if (item.type === 'video') {
      this.dom.video.classList.add('active');
      this.dom.audioVisualizerContainer.style.display = 'none';
      this.dom.currentTypeBadge.textContent = '🎬 Vídeo';
      this.dom.btnPip.style.display = 'inline-flex';
    } else {
      this.dom.video.classList.remove('active');
      this.dom.audioVisualizerContainer.style.display = 'flex';
      this.dom.currentTypeBadge.textContent = '🎵 Áudio';
      this.dom.btnPip.style.display = 'none';
    }

    // Carrega a fonte da mídia
    activeEl.src = item.url;
    activeEl.volume = this.isMuted ? 0 : this.volume;
    activeEl.playbackRate = this.playbackRate;

    // Atualiza metadados na tela
    this.dom.currentTrackTitle.textContent = item.title;
    this.dom.currentTrackSource.textContent = item.source || 'Arquivo Carregado';
    this.dom.currentItemLoopCount.textContent = item.loopCount || 0;

    // Atualiza estado do painel A-B
    this.updateAbPanelUI(item);
    this.renderPlaylist();

    // Ativa Web Audio se for áudio
    if (item.type === 'audio') {
      this.ensureAudioContext();
    }

    // Atualiza Media Session da barra do sistema operacional
    this.updateMediaSession(item);

    if (autoPlay) {
      activeEl.play().then(() => {
        this.isPlaying = true;
        this.updatePlayPauseUI(true);
      }).catch((err) => {
        console.warn('Reprodução automática bloqueada pelo navegador:', err);
        this.isPlaying = false;
        this.updatePlayPauseUI(false);
        if (err.name === 'NotAllowedError') {
          this.showToast('Clique no botão ▶ Play para iniciar a reprodução.');
        }
      });
    }
  }

  togglePlayPause() {
    if (this.playlist.length === 0) {
      this.showToast('Adicione arquivos de vídeo ou áudio para começar.');
      this.dom.localFileInput.click();
      return;
    }

    if (this.currentIndex === -1) {
      this.loadItem(0, true);
      return;
    }

    const activeEl = this.getActiveElement();
    if (activeEl.paused) {
      activeEl.play().then(() => {
        this.isPlaying = true;
        this.updatePlayPauseUI(true);
        this.showStagePulse('▶');
      }).catch((err) => {
        console.warn('Erro ao reproduzir:', err);
        this.showToast('Não foi possível iniciar a reprodução. Verifique o arquivo.', 'warning');
      });
    } else {
      activeEl.pause();
      this.isPlaying = false;
      this.updatePlayPauseUI(false);
      this.showStagePulse('⏸');
    }
  }

  showStagePulse(icon) {
    if (this.dom.stageCenterPulse) {
      this.dom.centerPulseIcon.textContent = icon;
      this.dom.stageCenterPulse.style.display = 'flex';
      this.dom.stageCenterPulse.classList.add('show');
      clearTimeout(this.pulseTimeout);
      this.pulseTimeout = setTimeout(() => {
        this.dom.stageCenterPulse.classList.remove('show');
        setTimeout(() => {
          this.dom.stageCenterPulse.style.display = 'none';
        }, 200);
      }, 500);
    }
  }

  onMediaError(el, e) {
    const err = el.error;
    let title = 'Erro na Mídia';
    let desc = 'Não foi possível reproduzir este arquivo.';

    if (err) {
      switch (err.code) {
        case 1: // MEDIA_ERR_ABORTED
          return;
        case 2: // MEDIA_ERR_NETWORK
          title = 'Erro de Rede';
          desc = 'Falha ao descarregar a mídia ou link inacessível.';
          break;
        case 3: // MEDIA_ERR_DECODE
          title = 'Erro de Decodificação';
          desc = 'O arquivo pode estar corrompido ou o codec não é suportado pelo seu navegador.';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          title = 'Formato ou Codec Incompatível';
          desc = 'O navegador não suporta este formato diretamente. Recomendamos usar vídeos em MP4 (H.264) ou WebM.';
          break;
      }
    }

    this.showMediaErrorNotice(title, desc);
    this.showToast(`${title}: ${desc}`, 'warning');
    this.isPlaying = false;
    this.updatePlayPauseUI(false);
  }

  showMediaErrorNotice(title, desc) {
    if (this.dom.stageErrorNotice) {
      this.dom.stageErrorTitle.textContent = title;
      this.dom.stageErrorDesc.textContent = desc;
      this.dom.stageErrorNotice.style.display = 'flex';
    }
  }

  hideMediaErrorNotice() {
    if (this.dom.stageErrorNotice) {
      this.dom.stageErrorNotice.style.display = 'none';
    }
  }

  updatePlayPauseUI(playing) {
    if (playing) {
      this.dom.iconPlay.style.display = 'none';
      this.dom.iconPause.style.display = 'block';
      this.dom.audioDisc.classList.add('spinning');
    } else {
      this.dom.iconPlay.style.display = 'block';
      this.dom.iconPause.style.display = 'none';
      this.dom.audioDisc.classList.remove('spinning');
    }
  }

  onNativePlayState(playing) {
    this.isPlaying = playing;
    this.updatePlayPauseUI(playing);
  }

  /* ==========================================================================
     Lógica Central: Repetição Contínua e Checkpoints
     ========================================================================== */

  /**
   * Alterna o botão mestre de repetições (Infinito Ligado / Desligado)
   */
  toggleMasterLoop() {
    if (this.repeatMode === 'infinite') {
      this.repeatMode = 'off';
      this.dom.btnMasterLoop.classList.remove('active');
      this.dom.btnMasterLoop.classList.add('disabled');
      this.dom.masterLoopTitle.textContent = 'Repetição: DESLIGADA';
      this.dom.masterLoopDesc.textContent = 'Reproduzirá a fila normalmente uma vez';
      this.dom.repeatStatusBadge.classList.add('disabled');
      this.dom.repeatStatusText.textContent = 'Repetições: Desativadas';
      this.showToast('Repetições contínuas desativadas.');
    } else {
      this.repeatMode = 'infinite';
      this.dom.btnMasterLoop.classList.add('active');
      this.dom.btnMasterLoop.classList.remove('disabled');
      this.dom.masterLoopTitle.textContent = 'Repetição Infinita: LIGADA';
      this.dom.masterLoopDesc.textContent = 'Repetindo mídias com checkpoint ativo';
      this.dom.repeatStatusBadge.classList.remove('disabled');
      this.dom.repeatStatusText.textContent = 'Repetições: Ativas';
      this.showToast('Repetição contínua ativada com sucesso! 🔁');
    }
  }

  /**
   * Disparado quando uma mídia chega ao fim do arquivo
   */
  onMediaEnded() {
    const currentItem = this.playlist[this.currentIndex];
    if (currentItem) {
      currentItem.loopCount = (currentItem.loopCount || 0) + 1;
      this.dom.currentItemLoopCount.textContent = currentItem.loopCount;
      this.totalLoopsCount++;
    }

    if (this.repeatMode === 'off') {
      // Se a repetição estiver desligada, apenas toca a próxima na ordem linear
      if (this.currentIndex < this.playlist.length - 1) {
        this.loadItem(this.currentIndex + 1, true);
      } else {
        this.isPlaying = false;
        this.updatePlayPauseUI(false);
        this.showToast('Fim da lista de reprodução.');
      }
      return;
    }

    // Modo Repetição Infinita Ativo: Busca o próximo item com CHECKPOINT ativo
    const nextCheckpointIndex = this.findNextCheckpointIndex(this.currentIndex);

    if (nextCheckpointIndex !== -1) {
      // Se encontrou um item com checkpoint marcado
      this.loadItem(nextCheckpointIndex, true);
      
      const nextItem = this.playlist[nextCheckpointIndex];
      if (nextCheckpointIndex === this.currentIndex) {
        this.showToast(`Repetindo "${nextItem.title}" (Volta ${nextItem.loopCount})`);
      } else {
        this.showToast(`Avançando ciclo para: "${nextItem.title}"`);
      }
    } else {
      // Se nenhuma mídia tiver checkpoint marcado, repete a própria atual
      const activeEl = this.getActiveElement();
      activeEl.currentTime = 0;
      activeEl.play();
      this.showToast(`Nenhum checkpoint ativo. Repetindo "${currentItem.title}"`);
    }
  }

  /**
   * Encontra a próxima mídia com checkpoint marcado, em ciclo infinito
   */
  findNextCheckpointIndex(startIndex) {
    if (this.playlist.length === 0) return -1;

    const total = this.playlist.length;
    // Percorre a partir do próximo até dar a volta completa
    for (let i = 1; i <= total; i++) {
      const idx = (startIndex + i) % total;
      if (this.playlist[idx].checkpoint) {
        return idx;
      }
    }

    // Se nenhuma mídia estiver com checkpoint, retorna o próprio item se existir
    return startIndex;
  }

  playNext() {
    if (this.playlist.length === 0) return;
    const nextIdx = (this.currentIndex + 1) % this.playlist.length;
    this.loadItem(nextIdx, true);
  }

  playPrevious() {
    if (this.playlist.length === 0) return;
    const prevIdx = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadItem(prevIdx, true);
  }

  /* ==========================================================================
     Lógica de Checkpoint A-B (Repetição de Trecho / Segment Loop)
     ========================================================================== */
  onTimeUpdate() {
    const activeEl = this.getActiveElement();
    const cur = activeEl.currentTime || 0;
    const dur = activeEl.duration || 0;

    if (!isNaN(dur) && dur > 0) {
      const progressPercent = (cur / dur) * 100;
      this.dom.timelineProgress.style.width = `${progressPercent}%`;
      this.dom.timelineSlider.value = progressPercent;
    }

    this.dom.currentTimeDisplay.textContent = this.formatTime(cur);

    // Verificação do Loop A-B
    const currentItem = this.playlist[this.currentIndex];
    if (currentItem && currentItem.abActive && currentItem.pointA !== null && currentItem.pointB !== null) {
      if (currentItem.pointB > currentItem.pointA && cur >= currentItem.pointB) {
        // Chegou ao Ponto B! Volta instantaneamente para o Ponto A
        activeEl.currentTime = currentItem.pointA;
        currentItem.loopCount = (currentItem.loopCount || 0) + 1;
        this.dom.currentItemLoopCount.textContent = currentItem.loopCount;
        this.totalLoopsCount++;

        // Micro-animação visual no notice A-B
        this.dom.abLoopNotice.classList.add('pulse');
        setTimeout(() => this.dom.abLoopNotice.classList.remove('pulse'), 400);
      }
    }
  }

  onLoadedMetadata() {
    const activeEl = this.getActiveElement();
    const dur = activeEl.duration || 0;
    this.dom.totalDurationDisplay.textContent = this.formatTime(dur);
    this.updateTimelineAbMarkers();
  }

  onTimelineScrub(e) {
    const activeEl = this.getActiveElement();
    const dur = activeEl.duration || 0;
    if (dur > 0) {
      const targetTime = (parseFloat(e.target.value) / 100) * dur;
      activeEl.currentTime = targetTime;
    }
  }

  seekRelative(deltaSeconds) {
    const activeEl = this.getActiveElement();
    activeEl.currentTime = Math.max(0, Math.min(activeEl.duration || 0, activeEl.currentTime + deltaSeconds));
  }

  setAbMarker(point) {
    const currentItem = this.playlist[this.currentIndex];
    if (!currentItem) {
      this.showToast('Nenhuma mídia em reprodução para marcar checkpoint.');
      return;
    }

    const activeEl = this.getActiveElement();
    const cur = activeEl.currentTime || 0;

    if (point === 'A') {
      currentItem.pointA = cur;
      this.showToast(`Ponto A definido em ${this.formatTime(cur)}`);
    } else if (point === 'B') {
      if (currentItem.pointA !== null && cur <= currentItem.pointA) {
        this.showToast('O Ponto B precisa ser maior que o Ponto A.', 'warning');
        return;
      }
      currentItem.pointB = cur;
      currentItem.abActive = true;
      this.showToast(`Ponto B definido em ${this.formatTime(cur)}. Loop A-B Ativado!`);
    }

    this.updateAbPanelUI(currentItem);
    this.renderPlaylist();
  }

  clearAbMarkers() {
    const currentItem = this.playlist[this.currentIndex];
    if (!currentItem) return;

    currentItem.pointA = null;
    currentItem.pointB = null;
    currentItem.abActive = false;

    this.updateAbPanelUI(currentItem);
    this.renderPlaylist();
    this.showToast('Marcadores A-B resetados.');
  }

  onToggleAb(active) {
    const currentItem = this.playlist[this.currentIndex];
    if (!currentItem) return;

    if (active && (currentItem.pointA === null || currentItem.pointB === null)) {
      this.showToast('Defina os pontos A e B antes de ativar o loop de trecho.');
      this.dom.toggleAbActive.checked = false;
      return;
    }

    currentItem.abActive = active;
    this.updateAbPanelUI(currentItem);
    this.renderPlaylist();
    this.showToast(active ? 'Loop de trecho A-B ativado!' : 'Loop de trecho desativado.');
  }

  updateAbPanelUI(item) {
    if (!item) {
      this.dom.valPointA.textContent = '--:--';
      this.dom.valPointB.textContent = '--:--';
      this.dom.toggleAbActive.checked = false;
      this.dom.abLoopNotice.style.display = 'none';
      this.dom.timelineAbSegment.style.display = 'none';
      this.dom.markerA.style.display = 'none';
      this.dom.markerB.style.display = 'none';
      return;
    }

    this.dom.valPointA.textContent = item.pointA !== null ? this.formatTime(item.pointA) : '--:--';
    this.dom.valPointB.textContent = item.pointB !== null ? this.formatTime(item.pointB) : '--:--';
    this.dom.toggleAbActive.checked = !!item.abActive;

    if (item.abActive && item.pointA !== null && item.pointB !== null) {
      this.dom.abLoopNotice.style.display = 'flex';
      this.dom.abDisplayRange.textContent = `${this.formatTime(item.pointA)} → ${this.formatTime(item.pointB)}`;
    } else {
      this.dom.abLoopNotice.style.display = 'none';
    }

    this.updateTimelineAbMarkers();
  }

  updateTimelineAbMarkers() {
    const currentItem = this.playlist[this.currentIndex];
    const activeEl = this.getActiveElement();
    const dur = activeEl.duration || 0;

    if (!currentItem || dur <= 0) {
      this.dom.timelineAbSegment.style.display = 'none';
      this.dom.markerA.style.display = 'none';
      this.dom.markerB.style.display = 'none';
      return;
    }

    if (currentItem.pointA !== null) {
      const leftPercentA = (currentItem.pointA / dur) * 100;
      this.dom.markerA.style.left = `${leftPercentA}%`;
      this.dom.markerA.style.display = 'flex';
    } else {
      this.dom.markerA.style.display = 'none';
    }

    if (currentItem.pointB !== null) {
      const leftPercentB = (currentItem.pointB / dur) * 100;
      this.dom.markerB.style.left = `${leftPercentB}%`;
      this.dom.markerB.style.display = 'flex';
    } else {
      this.dom.markerB.style.display = 'none';
    }

    if (currentItem.pointA !== null && currentItem.pointB !== null && currentItem.pointB > currentItem.pointA) {
      const leftPercent = (currentItem.pointA / dur) * 100;
      const widthPercent = ((currentItem.pointB - currentItem.pointA) / dur) * 100;
      this.dom.timelineAbSegment.style.left = `${leftPercent}%`;
      this.dom.timelineAbSegment.style.width = `${widthPercent}%`;
      this.dom.timelineAbSegment.style.display = 'block';
    } else {
      this.dom.timelineAbSegment.style.display = 'none';
    }
  }

  /* ==========================================================================
     Gerenciador de Playlist
     ========================================================================== */
  addItemToPlaylist(mediaData, shouldPlay = false) {
    const newItem = {
      id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: mediaData.title || 'Mídia sem título',
      type: mediaData.type || 'audio',
      url: mediaData.url,
      source: mediaData.source || 'Arquivo Local',
      duration: mediaData.duration || 0,
      checkpoint: true, // Por padrão, entra no ciclo de repetição
      pointA: null,
      pointB: null,
      abActive: false,
      loopCount: 0,
      isDemo: !!mediaData.isDemo
    };

    this.playlist.push(newItem);
    this.renderPlaylist();

    if (shouldPlay || this.currentIndex === -1) {
      this.loadItem(this.playlist.length - 1, true);
    }
  }

  renderPlaylist() {
    this.dom.playlistCountBadge.textContent = `${this.playlist.length} mídia${this.playlist.length !== 1 ? 's' : ''}`;

    if (this.playlist.length === 0) {
      this.dom.playlistEmptyState.style.display = 'flex';
      this.dom.playlistItemsList.innerHTML = '';
      return;
    }

    this.dom.playlistEmptyState.style.display = 'none';
    this.dom.playlistItemsList.innerHTML = '';

    this.playlist.forEach((item, index) => {
      const isCurrent = index === this.currentIndex;
      const itemEl = document.createElement('div');
      itemEl.className = `playlist-item ${isCurrent ? 'playing' : ''}`;
      itemEl.dataset.index = index;

      // Badges adicionais
      let abBadgeHtml = '';
      if (item.abActive && item.pointA !== null && item.pointB !== null) {
        abBadgeHtml = `<span class="item-ab-badge">Loop A-B: ${this.formatTime(item.pointA)} - ${this.formatTime(item.pointB)}</span>`;
      }

      itemEl.innerHTML = `
        <div class="item-left-group">
          <!-- Checkbox do Checkpoint -->
          <div class="item-checkpoint-box" title="${item.checkpoint ? 'Checkpoint marcado para repetir' : 'Checkpoint desmarcado (será ignorado na repetição)'}">
            <input type="checkbox" class="checkpoint-checkbox" ${item.checkpoint ? 'checked' : ''} data-index="${index}">
          </div>

          <span class="item-type-icon">${item.type === 'video' ? '🎬' : '🎵'}</span>

          <div class="item-info">
            <span class="item-title" title="${item.title}">${item.title}</span>
            <div class="item-meta-row">
              <span>${item.source}</span>
              ${abBadgeHtml}
              ${item.loopCount > 0 ? `<span>• 🔁 ${item.loopCount}x</span>` : ''}
            </div>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn-item-action btn-item-play" title="Tocar esta mídia agora" data-index="${index}">
            ▶
          </button>
          <button class="btn-item-action btn-item-delete" title="Remover da lista" data-index="${index}">
            ✕
          </button>
        </div>
      `;

      // Eventos dos botões do item
      const checkbox = itemEl.querySelector('.checkpoint-checkbox');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleItemCheckpoint(index, checkbox.checked);
      });

      const btnPlay = itemEl.querySelector('.btn-item-play');
      btnPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        this.loadItem(index, true);
      });

      const btnDelete = itemEl.querySelector('.btn-item-delete');
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteItem(index);
      });

      itemEl.addEventListener('click', () => {
        this.loadItem(index, true);
      });

      this.dom.playlistItemsList.appendChild(itemEl);
    });
  }

  toggleItemCheckpoint(index, checked) {
    if (this.playlist[index]) {
      this.playlist[index].checkpoint = checked;
      const itemTitle = this.playlist[index].title;
      this.showToast(
        checked 
          ? `Checkpoint ativado para "${itemTitle}". Incluído no ciclo! ✅` 
          : `Checkpoint desativado para "${itemTitle}". Será pulado no ciclo. ❌`
      );
    }
  }

  toggleAllCheckpoints() {
    if (this.playlist.length === 0) return;
    const allChecked = this.playlist.every(item => item.checkpoint);
    const newState = !allChecked;
    this.playlist.forEach(item => item.checkpoint = newState);
    this.renderPlaylist();
    this.showToast(newState ? 'Todos os checkpoints foram ativados!' : 'Todos os checkpoints foram desativados!');
  }

  deleteItem(index) {
    if (index < 0 || index >= this.playlist.length) return;
    const deletedTitle = this.playlist[index].title;

    if (index === this.currentIndex) {
      this.dom.video.pause();
      this.dom.audio.pause();
      this.playlist.splice(index, 1);
      if (this.playlist.length > 0) {
        this.loadItem(Math.min(index, this.playlist.length - 1), this.isPlaying);
      } else {
        this.currentIndex = -1;
        this.resetPlayerUI();
      }
    } else {
      if (index < this.currentIndex) {
        this.currentIndex--;
      }
      this.playlist.splice(index, 1);
      this.renderPlaylist();
    }

    this.showToast(`"${deletedTitle}" foi removido.`);
  }

  clearPlaylist() {
    if (this.playlist.length === 0) return;
    this.dom.video.pause();
    this.dom.audio.pause();
    this.playlist = [];
    this.currentIndex = -1;
    this.resetPlayerUI();
    this.renderPlaylist();
    this.showToast('A lista de reprodução foi esvaziada.');
  }

  resetPlayerUI() {
    this.hideMediaErrorNotice();
    this.dom.currentTrackTitle.textContent = 'Nenhuma mídia selecionada';
    this.dom.currentTrackSource.textContent = 'Adicione arquivos locais ou use as amostras';
    this.dom.currentTimeDisplay.textContent = '00:00';
    this.dom.totalDurationDisplay.textContent = '00:00';
    this.dom.timelineProgress.style.width = '0%';
    this.dom.timelineSlider.value = 0;
    this.dom.currentItemLoopCount.textContent = '0';
    this.dom.currentTypeBadge.textContent = 'Pronto';
    this.updateAbPanelUI(null);
    this.updatePlayPauseUI(false);
  }

  /* ==========================================================================
     Importação de Arquivos Locais e Drag & Drop
     ========================================================================== */
  handleLocalFiles(files) {
    if (!files || files.length === 0) return;

    const videoExtensions = ['mp4', 'webm', 'ogg', 'ogv', 'mov', 'mkv', 'avi', 'm4v', 'wmv', 'flv', '3gp', 'ts'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'oga', 'aac', 'flac', 'm4a', 'opus', 'weba', 'wma'];

    // Se a playlist só tiver itens de demonstração, remove-os para priorizar os arquivos reais do usuário
    const hasOnlyDemos = this.playlist.length > 0 && this.playlist.every(item => item.isDemo);
    if (hasOnlyDemos) {
      this.playlist = [];
      this.currentIndex = -1;
    }

    const startIndex = this.playlist.length;
    let addedCount = 0;

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      let isVideo = file.type.startsWith('video/') || videoExtensions.includes(ext);
      let isAudio = file.type.startsWith('audio/') || audioExtensions.includes(ext);

      // Se o sistema operacional não forneceu o MIME type, inspeciona pela extensão
      if (!isVideo && !isAudio) {
        if (file.name.match(/\.(mp4|m4v|mov|mkv|webm|avi|flv|wmv|ts|3gp)$/i)) {
          isVideo = true;
        } else if (file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a|opus|wma)$/i)) {
          isAudio = true;
        } else {
          // Assume vídeo como fallback para formatos de mídia não classificados
          isVideo = true;
        }
      }

      const objectUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, "");

      this.playlist.push({
        id: 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        title: title,
        type: isVideo ? 'video' : 'audio',
        url: objectUrl,
        source: `Arquivo Local (${this.formatBytes(file.size)})`,
        checkpoint: true,
        pointA: null,
        pointB: null,
        abActive: false,
        loopCount: 0,
        isDemo: false
      });
      addedCount++;
    });

    if (addedCount > 0) {
      this.renderPlaylist();
      // Sempre carrega e inicia imediatamente a primeira mídia adicionada pelo usuário
      this.loadItem(startIndex, true);
      this.showToast(`${addedCount} mídia(s) adicionada(s)! Reproduzindo "${this.playlist[startIndex].title}"`);
    } else {
      this.showToast('Nenhum arquivo compatível selecionado.', 'warning');
    }
  }

  setupDragAndDrop() {
    const dropTargets = [this.dom.playlistDropZone, this.dom.stageContainer];

    dropTargets.forEach(target => {
      if (!target) return;

      ['dragenter', 'dragover'].forEach(eventName => {
        target.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (target === this.dom.playlistDropZone) {
            target.style.borderColor = 'var(--primary)';
            target.style.background = 'rgba(99, 102, 241, 0.12)';
          } else {
            target.style.boxShadow = '0 0 25px var(--primary-glow)';
          }
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        target.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (target === this.dom.playlistDropZone) {
            target.style.borderColor = 'var(--border-glass)';
            target.style.background = 'rgba(0, 0, 0, 0.2)';
          } else {
            target.style.boxShadow = 'none';
          }
        });
      });

      target.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleLocalFiles(files);
      });
    });

    // Impede que o navegador abra o arquivo caso o usuário solte acidentalmente fora dos alvos
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());
  }

  /* ==========================================================================
     Adição via URL
     ========================================================================== */
  openUrlModal() {
    this.dom.inputMediaUrl.value = '';
    this.dom.inputMediaTitle.value = '';
    this.dom.urlModal.style.display = 'flex';
    this.dom.inputMediaUrl.focus();
  }

  closeUrlModal() {
    this.dom.urlModal.style.display = 'none';
  }

  submitUrlModal() {
    const url = this.dom.inputMediaUrl.value.trim();
    if (!url) {
      this.showToast('Por favor, insira o link da mídia.', 'warning');
      return;
    }

    const title = this.dom.inputMediaTitle.value.trim() || 'Mídia da Web';
    const radioVal = document.querySelector('input[name="mediaTypeRadio"]:checked').value;

    let mediaType = 'audio';
    if (radioVal === 'video') {
      mediaType = 'video';
    } else if (radioVal === 'audio') {
      mediaType = 'audio';
    } else {
      // Auto detect
      if (/\.(mp4|webm|mkv|mov|ogg)$/i.test(url)) {
        mediaType = 'video';
      } else {
        mediaType = 'audio';
      }
    }

    this.addItemToPlaylist({
      title: title,
      type: mediaType,
      url: url,
      source: 'Mídia Externa (URL)'
    }, true);

    this.closeUrlModal();
    this.showToast(`Mídia adicionada via link com sucesso!`);
  }

  /* ==========================================================================
     Amostras Demo (100% Funcionais com URLs verificadas)
     ========================================================================== */
  loadDemosAutomatically() {
    // Mantém a inicialização limpa para foco imediato nas mídias do usuário
  }

  loadDemos(autoPlay = true) {
    // Amostras verificadas com status HTTP 200 OK
    const sampleItems = [
      {
        title: "Big Buck Bunny - Animação Demo (MP4)",
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        source: "Amostra MP4 (W3Schools)",
        isDemo: true
      },
      {
        title: "Sintel Open Movie - Animação (WebM)",
        type: "video",
        url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm",
        source: "Amostra WebM (Wikimedia)",
        isDemo: true
      },
      {
        title: "Som da Natureza (Amostra de Áudio MP3)",
        type: "audio",
        url: "https://www.w3schools.com/html/horse.mp3",
        source: "Amostra de Áudio",
        isDemo: true
      }
    ];

    const startIndex = this.playlist.length;
    sampleItems.forEach(sample => {
      this.addItemToPlaylist(sample, false);
    });

    if (autoPlay || this.currentIndex === -1) {
      this.loadItem(startIndex, true);
    }

    this.showToast('Amostras demo de vídeo e áudio carregadas com sucesso!');
  }

  /* ==========================================================================
     Volume, Velocidade, Fullscreen, Wake Lock & PIP
     ========================================================================== */
  setVolume(vol) {
    this.volume = vol;
    this.isMuted = vol === 0;
    const activeEl = this.getActiveElement();
    activeEl.volume = this.volume;

    this.dom.volumeSlider.value = this.volume;
    this.dom.volumeIcon.textContent = this.isMuted ? '🔇' : (this.volume < 0.5 ? '🔉' : '🔊');
  }

  toggleMute() {
    const activeEl = this.getActiveElement();
    this.isMuted = !this.isMuted;
    activeEl.muted = this.isMuted;
    this.dom.volumeIcon.textContent = this.isMuted ? '🔇' : (this.volume < 0.5 ? '🔉' : '🔊');
  }

  setPlaybackRate(rate) {
    this.playbackRate = rate;
    const activeEl = this.getActiveElement();
    activeEl.playbackRate = this.playbackRate;
    this.showToast(`Velocidade ajustada para ${rate}x`);
  }

  async togglePictureInPicture() {
    if (!document.pictureInPictureEnabled) {
      this.showToast('Picture-in-Picture não é suportado pelo seu navegador.', 'warning');
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (this.dom.video.classList.contains('active')) {
        await this.dom.video.requestPictureInPicture();
      } else {
        this.showToast('PIP está disponível apenas para vídeos.');
      }
    } catch (err) {
      console.warn('Erro ao alternar Picture-in-Picture:', err);
    }
  }

  toggleFullscreen() {
    const stage = this.dom.stageContainer;
    if (!document.fullscreenElement) {
      stage.requestFullscreen().catch(err => {
        this.showToast(`Erro ao entrar em tela cheia: ${err.message}`, 'warning');
      });
    } else {
      document.exitFullscreen();
    }
  }

  async toggleWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        if (this.wakeLockSentinel) {
          await this.wakeLockSentinel.release();
          this.wakeLockSentinel = null;
          this.dom.btnWakeLock.classList.remove('active');
          this.showToast('Modo tela ativa desligado.');
        } else {
          this.wakeLockSentinel = await navigator.wakeLock.request('screen');
          this.dom.btnWakeLock.classList.add('active');
          this.showToast('Tela mantida sempre ativa durante as repetições!');
          this.wakeLockSentinel.addEventListener('release', () => {
            this.dom.btnWakeLock.classList.remove('active');
          });
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
        this.showToast('Não foi possível ativar o Wake Lock neste navegador.', 'warning');
      }
    } else {
      this.showToast('Wake Lock não é suportado neste navegador.', 'warning');
    }
  }

  /* ==========================================================================
     Visualizador de Áudio (Canvas e Web Audio API)
     ========================================================================== */
  setupVisualizer() {
    const canvas = this.dom.canvas;
    const ctx = canvas.getContext('2d');

    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);

      // Redimensionamento correto do canvas
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      if (!this.analyser || !this.isPlaying || this.playlist[this.currentIndex]?.type !== 'audio') {
        // Onda relaxante suave quando parado ou sem áudio
        this.drawIdleWave(ctx, width, height);
        return;
      }

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      const barCount = Math.min(64, bufferLength);
      const barWidth = (width / barCount) * 0.8;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i];
        const barHeight = (val / 255) * height * 0.85;

        // Gradiente vibrante ciano / violeta
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.7)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.95)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        x += (width / barCount);
      }
    };

    render();
  }

  drawIdleWave(ctx, width, height) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 2;
    ctx.moveTo(0, height - 10);
    ctx.lineTo(width, height - 10);
    ctx.stroke();
  }

  ensureAudioContext() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 128;
        this.sourceNode = this.audioContext.createMediaElementSource(this.dom.audio);
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (err) {
      console.warn('Web Audio API não inicializado (restringido pelo browser até interação):', err);
    }
  }

  /* ==========================================================================
     Media Session API (Controles na Tela de Bloqueio do Windows/Mobile)
     ========================================================================== */
  updateMediaSession(item) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: 'Repeat Loop Player (Repetição Contínua)',
        album: item.source || 'Playlist Infinita',
        artwork: [
          { src: './icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => this.togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        const activeEl = this.getActiveElement();
        if (details.seekTime !== undefined) {
          activeEl.currentTime = details.seekTime;
        }
      });
    }
  }

  /* ==========================================================================
     PWA Service Worker & Instalação
     ========================================================================== */
  initPwa() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('Service Worker registrado:', reg.scope))
          .catch(err => console.warn('Falha ao registrar Service Worker:', err));
      });
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.dom.btnInstallPwa.style.display = 'inline-flex';

      this.dom.btnInstallPwa.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          this.showToast('Obrigado por instalar o Repeat Loop Player! 🎉');
        }
        deferredPrompt = null;
        this.dom.btnInstallPwa.style.display = 'none';
      });
    });
  }

  /* ==========================================================================
     Utilitários: Formatação e Toasts
     ========================================================================== */
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = mins < 10 ? `0${mins}` : mins;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;
    return `${formattedMins}:${formattedSecs}`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let icon = 'ℹ️';
    if (type === 'warning') icon = '⚠️';
    if (message.includes('🔁') || message.includes('Loop')) icon = '🔁';
    if (message.includes('✅') || message.includes('sucesso')) icon = '✨';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Inicia a aplicação após o DOM estar pronto
document.addEventListener('DOMContentLoaded', () => {
  window.repeatLoopPlayer = new RepeatLoopPlayerApp();
  window.loopPlayer = window.repeatLoopPlayer;
});
