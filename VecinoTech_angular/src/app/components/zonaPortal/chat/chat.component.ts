import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { StorageGlobalService } from '../../../services/storage-global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IMensaje } from '../../../models/interfaces_orm/chat/IMensaje';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  // ==================== DEPENDENCY INJECTION ====================

  private readonly chatService = inject(ChatService);
  private readonly storage = inject(StorageGlobalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ==================== SIGNALS ====================

  private readonly _solicitudId = signal<number>(0);
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string>('');
  readonly nuevoMensaje = signal<string>('');
  readonly enviando = signal<boolean>(false);
  readonly alturaTextarea = signal<number>(48);

  // ==================== COMPUTED ====================

  readonly solicitudId = computed(() => this._solicitudId());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
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

    // 1. Conectar WebSocket
    this.chatService.conectarWebSocket();

    // 2. Cargar historial
    this.chatService.cargarHistorial(this._solicitudId()).subscribe({
      next: (response) => {
        if (response.codigo === 0) {
          const mensajes = response.datos as IMensaje[];
          this.chatService.establecerMensajes(mensajes);
          console.log('📜 Historial cargado:', mensajes.length);

          // 3. Suscribirse al chat
          setTimeout(() => {
            this.chatService.suscribirseAlChat(this._solicitudId());
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
   * Scroll al final del chat
   */
  private scrollToBottom(): void {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

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

    const nombreOtro = this.usuarioConectado();
    return nombreOtro ? `${nombreOtro} está en línea` : 'Conectado';
  });

  /**
   * Volver atrás
   */
  volver(): void {
    this.router.navigate(['/portal']);
  }
}
