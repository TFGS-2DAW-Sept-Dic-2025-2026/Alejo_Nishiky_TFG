import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { StorageGlobalService } from '../../../services/storage-global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IMensaje } from '../../../models/chat/IMensaje';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../services/map.service';
import { SafePipe } from '../../../pipes/safe.pipe';
import { ModalValoracionComponent } from '../modal-valoracion/modal-valoracion.component';
import ISolicitudMapa from '../../../models/solicitud/ISolicitudMapa';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, SafePipe, ModalValoracionComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  // ==================== DEPENDENCY INJECTION ====================

  private readonly chatService = inject(ChatService);
  private readonly storage = inject(StorageGlobalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mapService = inject(MapService);

  // ==================== SIGNALS ====================

  private readonly _solicitudId = signal<number>(0);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');
  private readonly _solicitud = signal<ISolicitudMapa | null>(null);
  readonly nuevoMensaje = signal<string>('');
  readonly enviando = signal<boolean>(false);
  readonly alturaTextarea = signal<number>(48);
  readonly mostrarModalFinalizado = signal<boolean>(false);

  // ======= SEÑALES PARA VIDEOLLAMADA =========
  readonly mostrarVideoModal = signal<boolean>(false);
  readonly videoRoomUrl = signal<string>('');
  readonly videoRoomName = signal<string>('');
  readonly cargandoVideo = signal<boolean>(false);
  readonly mostrarModalConfirmacion = signal<boolean>(false);
  readonly mostrarModalValoracion = signal<boolean>(false);

  // ==================== COMPUTED ====================
  readonly solicitudId = computed(() => this._solicitudId());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly solicitud = computed(() => this._solicitud());
  readonly mensajes = this.chatService.mensajes;
  readonly conectado = this.chatService.conectado;
  readonly usuarioConectado = this.chatService.usuarioConectado;
  readonly usuariosEnLinea = this.chatService.usuariosEnLinea;
  readonly usuarioActual = this.storage.usuarioSig;

  // ==================== CONSTRUCTOR ====================

  constructor() {
    // Obtener ID de solicitud desde la ruta
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this._error.set('ID de solicitud inválido');
      return;
    }

    this._solicitudId.set(id);

    // Inicializar chat
    this.inicializarChat();

    // Auto-scroll cuando lleguen mensajes nuevos
    effect(() => {
      const mensajes = this.mensajes();
      if (mensajes.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
    // ✅ AÑADIR: Escuchar notificaciones de chat finalizado con effect
    effect(() => {
      const notifs = this.chatService.notificaciones();

      // Buscar si hay alguna notificación de tipo 'chat-finalizado'
      const chatFinalizado = notifs.find(n =>
        n.tipo === 'chat-finalizado' &&
        n.solicitudId === this._solicitudId()
      );

      if (chatFinalizado && !this.mostrarModalFinalizado()) {
        console.log('🔔 Chat finalizado detectado');
        this.mostrarModalFinalizado.set(true);
      }
    });

    // ✅ EFFECT 3: Detectar invitaciones de videollamada
    effect(() => {
      const invitacion = this.invitacionVideo();

      if (invitacion && !this.mostrarVideoModal()) {
        console.log('📹 Invitación de videollamada detectada');

        // Si la invitación no es del usuario actual, mostrar notificación
        const usuario = this.usuarioActual();
        if (usuario && invitacion.usuarioId !== usuario.id) {
          this.mostrarNotificacionVideo(invitacion.usuarioNombre);
        }
      }
    });

    // ✅ DEBUG: Monitorear usuarios en línea
    effect(() => {
      const enLinea = this.usuariosEnLinea();
      console.log('🔍 DEBUG - Usuarios en línea:', enLinea);
      console.log('🔍 DEBUG - Otro usuario en línea?', this.otroUsuarioEnLinea());
    });
  }

  // ==================== LIFECYCLE ====================

  ngOnDestroy(): void {
    this.chatService.notificarDesconexion(this._solicitudId());
    this.chatService.limpiarMensajes();
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Inicializa el chat
   */
  private inicializarChat(): void {
    this._loading.set(true);

    // 1. Cargar datos de la solicitud primero
    this.cargarDatosSolicitud();


    // 2. Conectar WebSocket
    this.chatService.conectarWebSocket();

    // 3. Cargar historial
    this.chatService.cargarHistorial(this._solicitudId()).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const mensajes = response.datos as IMensaje[];
          this.chatService.establecerMensajes(mensajes);
          console.log('📜 Historial cargado:', mensajes.length);

          // 4. Suscribirse al chat
          setTimeout(() => {
            this.chatService.suscribirseAlChat(this._solicitudId());

            // ✅ AÑADIR: Simular que el otro usuario está conectado si hay actividad reciente
            this.verificarUsuariosConectados();

            this._loading.set(false);
          }, 500);

        } else {
          this._error.set(response.mensaje);
          this._loading.set(false);
        }
      },
      error: (err) => {
        console.error('❌ Error cargando historial:', err);
        this._error.set('Error al cargar el chat');
        this._loading.set(false);
      }
    });
  }
  /**
   * Verifica si hay usuarios conectados inicialmente
   * (Para casos donde el otro usuario ya estaba conectado antes)
   */
  private verificarUsuariosConectados(): void {
    const solicitud = this._solicitud();
    const usuarioActual = this.usuarioActual();

    if (!solicitud || !usuarioActual) return;

    // Si soy el solicitante y hay un voluntario asignado
    if (solicitud.solicitante.id === usuarioActual.id && solicitud.voluntario) {
      console.log('👤 Asumiendo que el voluntario podría estar conectado');
      // No hacemos nada aquí, esperamos la notificación WebSocket
    }

    // Si soy el voluntario, asumir que el solicitante existe
    if (solicitud.voluntario && solicitud.voluntario.id === usuarioActual.id) {
      console.log('👤 Asumiendo que el solicitante podría estar conectado');
      // No hacemos nada aquí, esperamos la notificación WebSocket
    }
  }

  /**
   * Scroll al final del chat
   */
  private scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // ==================== MÉTODOS DE VIDEOLLAMADA ====================

  /**
   * Inicia una videollamada (método privado ahora)
   */
  private iniciarVideollamada(): void {
    if (this.cargandoVideo()) return;

    this.cargandoVideo.set(true);

    this.chatService.crearSalaVideo(this._solicitudId()).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const videoCall = response.datos as any; // VideoCallInviteDTO

          this.videoRoomUrl.set(videoCall.roomUrl);
          this.videoRoomName.set(videoCall.roomName);
          this.mostrarVideoModal.set(true);

          console.log('✅ Sala de videollamada creada:', videoCall.roomUrl);
        } else {
          alert('❌ ' + response.mensaje);
        }
        this.cargandoVideo.set(false);
      },
      error: (err) => {
        console.error('❌ Error creando sala:', err);
        alert('❌ Error al crear la videollamada');
        this.cargandoVideo.set(false);
      }
    });
  }

  /**
   * Unirse a la videollamada (cuando recibes invitación)
   */
  unirseAVideollamada(): void {
    const invitacion = this.invitacionVideo();
    if (!invitacion) return;

    // ✅ AHORA SÍ: Usar la URL que viene en la notificación
    if (invitacion.videoRoomUrl && invitacion.videoRoomName) {
      this.videoRoomUrl.set(invitacion.videoRoomUrl);
      this.videoRoomName.set(invitacion.videoRoomName);
      this.mostrarVideoModal.set(true);
    } else {
      alert('❌ No se pudo obtener la URL de la videollamada');
    }
  }

  /**
   * Cierra el modal de video
   */
  cerrarVideoModal(): void {
    this.mostrarVideoModal.set(false);
    this.videoRoomUrl.set('');
    this.videoRoomName.set('');

    // Limpiar notificación
    this.chatService.eliminarNotificacion(this._solicitudId());
  }

  /**
   * Muestra notificación cuando llega invitación
   */
  private mostrarNotificacionVideo(nombreUsuario: string): void {
    // Opcional: Puedes usar un toast o notificación más elegante
    const unirse = confirm(
      `📹 ${nombreUsuario} ha iniciado una videollamada\n\n¿Deseas unirte?`
    );

    if (unirse) {
      this.unirseAVideollamada();
    }
  }

  readonly puedeIniciarVideo = computed(() => {
    const solicitud = this._solicitud();
    const conectadoWS = this.conectado();

    // Validar que haya solicitud y esté conectado
    if (!solicitud || !conectadoWS) {
      return false;
    }

    // Validar que la solicitud esté EN_PROCESO
    if (solicitud.estado !== 'EN_PROCESO') {
      return false;
    }

    // Validar que haya un voluntario asignado
    if (!solicitud.voluntario) {
      return false;
    }

    return true;
  });

  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Envía un mensaje
   */
  enviarMensaje(): void {
    const contenido = this.nuevoMensaje().trim();
    if (!contenido) return;

    this.enviando.set(true);

    this.chatService.enviarMensaje(this._solicitudId(), contenido).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          console.log('✅ Mensaje enviado');
          this.nuevoMensaje.set('');
        } else {
          alert('❌ ' + response.mensaje);
        }
        this.enviando.set(false);
      },
      error: (err) => {
        console.error('❌ Error enviando mensaje:', err);
        alert('❌ Error al enviar mensaje');
        this.enviando.set(false);
      }
    });
  }

  /**
   * Verifica si el mensaje es del usuario actual
   */
  esMensajePropio(mensaje: IMensaje): boolean {
    const usuario = this.usuarioActual();
    return usuario ? mensaje.remitenteId === usuario.id : false;
  }

    /**
   * Ajusta la altura del textarea automáticamente
   */
  ajustarAltura(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;

    // Resetear altura para calcular correctamente
    textarea.style.height = 'auto';

    // Calcular nueva altura (máximo 200px = ~8 líneas)
    const nuevaAltura = Math.min(textarea.scrollHeight, 200);
    this.alturaTextarea.set(nuevaAltura);
  }

  /**
   * Formatea la fecha del mensaje
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const hoy = new Date();

    const esHoy = date.toDateString() === hoy.toDateString();

    if (esHoy) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  // ==================== MÉTODOS PÚBLICOS ====================

  /**
   * Actualiza el valor del mensaje (two-way binding manual)
   */
  actualizarMensaje(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.nuevoMensaje.set(textarea.value);
  }

  /**
   * Maneja el evento Enter en el textarea
   */
  manejarEnter(event: Event): void {
    // Verificar que sea un KeyboardEvent
    if (!(event instanceof KeyboardEvent)) return;

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
    // Si es Shift + Enter, permite el salto de línea (comportamiento por defecto)
  }

  readonly esSolicitante = computed(() => {
    const solicitud = this._solicitud();
    const usuario = this.usuarioActual();

    if (!solicitud || !usuario) return false;

    return solicitud.solicitante.id === usuario.id;
  });

  // ✅ AÑADIR: Computed para saber si el otro usuario está en línea
  readonly otroUsuarioEnLinea = computed(() => {
    const usuario = this.usuarioActual();
    const enLinea = this.usuariosEnLinea();
    if (!usuario) return false;

    // Verificar si hay alguien más en línea aparte del usuario actual
    return enLinea.some(id => id !== usuario.id);
  });

  // ✅ AÑADIR: Texto del estado
  readonly textoEstado = computed(() => {
    if (!this.otroUsuarioEnLinea()) {
      return 'Esperando conexión...';
    }

    const solicitud = this._solicitud();
    const usuario = this.usuarioActual();

    if (!solicitud || !usuario) {
      return 'Conectado';
    }

    // Determinar quién es "el otro"
    if (solicitud.solicitante.id === usuario.id) {
      // Soy el solicitante, el otro es el voluntario
      return solicitud.voluntario
        ? `${solicitud.voluntario.nombre} está en línea`
        : 'Voluntario está en línea';
    } else {
      // Soy el voluntario, el otro es el solicitante
      return `${solicitud.solicitante.nombre} está en línea`;
    }
  });

  /**
 * ✅ NUEVO: Carga los datos de la solicitud
 */
  private cargarDatosSolicitud(): void {
    this.mapService.getMisSolicitudes().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const solicitudes = response.datos as ISolicitudMapa[];
          const solicitud = solicitudes.find(s => s.id === this._solicitudId());

          if (solicitud) {
            this._solicitud.set(solicitud);
            console.log('✅ Solicitud cargada (como solicitante):', solicitud);
          } else {
          // Si no la encontró, intentar como voluntario
          this.cargarSolicitudComoVoluntario();
        }
        }
      },
      error: (err) => {
        console.error('❌ Error cargando solicitud:', err);
      }
    });
  }

    /**
   * Carga la solicitud cuando el usuario es voluntario
   */
  private cargarSolicitudComoVoluntario(): void {
    this.mapService.getSolicitudesComoVoluntario().subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const solicitudes = response.datos as ISolicitudMapa[];
          const solicitud = solicitudes.find(s => s.id === this._solicitudId());

          if (solicitud) {
            this._solicitud.set(solicitud);
            console.log('✅ Solicitud cargada (como voluntario):', solicitud);
          } else {
            console.warn('⚠️ No se encontró la solicitud');
          }
        }
      },
      error: (err) => {
        console.error('❌ Error cargando solicitud como voluntario:', err);
      }
    });
  }

  /**
   * Detecta invitaciones de videollamada
   */
  readonly invitacionVideo = computed(() => {
    const notifs = this.chatService.notificaciones();
    return notifs.find(n =>
      n.tipo === 'video-call-invite' &&
      n.solicitudId === this._solicitudId()
    );
  });

  /**
 * ✅ NUEVO: Finalizar el chat (solo solicitante)
 */
  finalizarChat(): void {
    if (!confirm('¿Finalizar este chat?\n\nAl finalizar, confirmas que has recibido la asistencia satisfactoriamente.')) {
      return;
    }

    this.enviando.set(true);

    this.mapService.completarSolicitud(this._solicitudId()).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          console.log('✅ Chat finalizado');

          this.enviando.set(false);
          this.mostrarModalValoracion.set(true);

        } else {
          alert('❌ ' + response.mensaje);
          this.enviando.set(false);
        }
        this.enviando.set(false);
      },
      error: (err) => {
        console.error('❌ Error finalizando chat:', err);
        alert('❌ Error al finalizar el chat');
        this.enviando.set(false);
      }
    });
  }

  /**
   * Maneja el éxito de la valoración
   */
  onValoracionSuccess(): void {
    console.log('✅ Valoración completada');
    alert('✅ ¡Gracias por tu valoración!');
    this.router.navigate(['/portal/solicitante']);
  }

  /**
   * Cierra el modal de valoración sin valorar
   */
  onValoracionClose(): void {
    console.log('⚠️ Valoración omitida');
    this.mostrarModalValoracion.set(false);
    this.router.navigate(['/portal/solicitante']);
  }

  /**
   * Obtiene el nombre del voluntario
   */
  readonly nombreVoluntario = computed(() => {
    const solicitud = this._solicitud();
    return solicitud?.voluntario?.nombre || 'el voluntario';
  });

    /**
   * Muestra el modal de confirmación
   */
  mostrarModalConfirmacionVideo(): void {
    if (!this.conectado()) {
      alert('⚠️ No estás conectado al chat');
      return;
    }

    if (!this.otroUsuarioEnLinea()) {
      alert('⚠️ El otro usuario no está conectado');
      return;
    }

    this.mostrarModalConfirmacion.set(true);
  }
  /**
   * Cierra el modal de confirmación
   */
  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion.set(false);
  }

  /**
   * Confirma e inicia la videollamada
   */
  confirmarVideollamada(): void {
    this.mostrarModalConfirmacion.set(false);
    this.iniciarVideollamada();
  }

  /**
   * ✅ NUEVO: Cerrar modal de chat finalizado (voluntario)
   */
  cerrarModalFinalizado(): void {
    this.mostrarModalFinalizado.set(false);
    this.router.navigate(['/portal/voluntario']);
  }

  /**
   * Volver atrás
   */
  volver(): void {
    this.router.navigate(['/portal']);
  }
}
