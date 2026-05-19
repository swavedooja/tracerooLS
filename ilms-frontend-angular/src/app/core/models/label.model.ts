export interface LabelTemplate {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  status: string;
  canvas_design: any[];
  created_at?: string;
}

export interface PackagingHierarchy {
  id: string;
  name: string;
  created_at?: string;
}

export interface PackagingLevel {
  id: string;
  hierarchy_id: string;
  level_name: string;
  level_order: number;
  capacity: number;
  label_template_id?: string;
  label_template?: LabelTemplate;
}
