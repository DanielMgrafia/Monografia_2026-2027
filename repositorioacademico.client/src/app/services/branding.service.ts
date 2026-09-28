import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ConfiguracionInstitucion } from '../models/configuracion-institucion';

@Injectable({
  providedIn: 'root'
})
export class BrandingService {
  private static readonly DEFAULT_FAVICON = 'favicon.svg';

  private readonly document = inject(DOCUMENT);

  aplicarConfiguracion(configuracion: ConfiguracionInstitucion | null): void {
    const logoUrl = configuracion?.logoUrl?.trim();
    this.setFavicon(logoUrl || BrandingService.DEFAULT_FAVICON);
  }

  private setFavicon(href: string): void {
    const head = this.document.head;
    let link = this.document.querySelector<HTMLLinkElement>("link[rel~='icon']");

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
    }

    link.href = href;
    link.type = href.startsWith('data:') ? this.getMimeType(href) : 'image/svg+xml';
  }

  private getMimeType(dataUrl: string): string {
    const match = /^data:([^;,]+)/.exec(dataUrl);
    return match?.[1] || 'image/png';
  }
}
