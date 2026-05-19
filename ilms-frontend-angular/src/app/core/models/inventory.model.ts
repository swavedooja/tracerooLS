export interface InventoryItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  serialNumber?: string;
  batchNumber: string;
  status: string;
  qualityStatus: string;
  locationId?: string;
  locationCode?: string;
  locationName?: string;
  manufacturedAt?: string;
  expiresAt?: string;
  labelPrinted: string;
  createdAt: string;
}
