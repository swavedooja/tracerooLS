export interface Material {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  baseUom: string;
  isBatchManaged: boolean;
  isSerialManaged: boolean;
  shelfLifeDays?: number;
  minStock?: number;
  maxStock?: number;
  grossWeight?: number;
  netWeight?: number;
  weightUom: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUom: string;
  isHazmat?: boolean;
  hazmatClass?: string;
  unNumber?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string;
  images?: MaterialImage[];
  handlingParameters?: any[];
}

export interface MaterialImage {
  id: string;
  material_id: string;
  image_url: string;
  is_primary: boolean;
  sequence: number;
}
