export interface SublineaInvestigacion {
  id: number;
  descripcion: string;
  estado?: string;
  lineaInvestigacionId: number;
  lineaInvestigacion?: string;
}

export interface CrearSublineaInvestigacionPayload {
  descripcion: string;
  lineaInvestigacionId: number;
  estado?: string;
}
