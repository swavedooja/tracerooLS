export interface DashboardMetrics {
  total_inventory_count: number;
  active_inventory_count: number;
  packed_count: number;
  shipped_count: number;
  box_count: number;
  pallet_count: number;
  reserved_serials: number;
  consumed_serials: number;
  pre_inventory_count: number;
  sealed_containers: number;
}

export interface InventoryStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface DashboardAlert {
  severity: 'INFO' | 'WARNING' | 'ERROR';
  description: string;
  reference: string;
  timestamp: string;
}

export interface DashboardEvent {
  event_type: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  created_at: string;
  inventory?: {
    serial_number: string;
  };
}
