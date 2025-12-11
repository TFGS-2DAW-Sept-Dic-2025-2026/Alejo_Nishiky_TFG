import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para transformar URLs de avatares
 *
 * Casos que maneja:
 * 1. URL relativa del backend (/avatars/...) → añade http://localhost:8080
 * 2. URL completa (http://... o https://...) → usa tal cual
 * 3. null/undefined → genera avatar con UI Avatars usando el nombre
 * 4. String vacío → genera avatar con UI Avatars
 *
 * Uso:
 * <img [src]="usuario.avatarUrl | avatarUrl: usuario.nombre" />
 */
@Pipe({
  name: 'avatarUrl',
  standalone: true
})
export class AvatarUrlPipe implements PipeTransform {

  private readonly BACKEND_URL = 'http://localhost:8080';

  /**
   * Transforma la URL del avatar
   *
   * @param avatarUrl - URL del avatar (puede ser relativa, completa, null o vacía)
   * @param nombre - Nombre del usuario (para generar avatar por defecto)
   * @returns URL completa y válida del avatar
   */
  transform(avatarUrl: string | null | undefined, nombre?: string): string {

    // 1. Si no hay avatarUrl, generar con UI Avatars
    if (!avatarUrl || avatarUrl.trim() === '') {
      return this.generarAvatarPorDefecto(nombre);
    }

    // 2. Si es una URL relativa del backend (/avatars/...), añadir dominio
    if (avatarUrl.startsWith('/avatars/')) {
      return `${this.BACKEND_URL}${avatarUrl}`;
    }

    // 3. Si ya es una URL completa (http:// o https://), usarla tal cual
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    // 4. Si es solo el nombre del archivo (sin /avatars/), construir ruta completa
    if (!avatarUrl.includes('/')) {
      return `${this.BACKEND_URL}/avatars/${avatarUrl}`;
    }

    // 5. Fallback: intentar construir la URL
    return `${this.BACKEND_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
  }

  /**
   * Genera un avatar por defecto usando UI Avatars
   */
  private generarAvatarPorDefecto(nombre?: string): string {
    const displayName = nombre || 'Usuario';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128`;
  }
}
