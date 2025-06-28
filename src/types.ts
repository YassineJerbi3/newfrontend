// src/types.ts
export interface StatsByEmplacementDto {
  emplacementId: string;
  nom: string;
  type: "CLASSE" | "BUREAU";
  total: number;
  fonctionnel: number;
  enPanne: number;
}
