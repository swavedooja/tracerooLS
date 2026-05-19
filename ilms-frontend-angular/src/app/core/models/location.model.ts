export interface Location {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  parentId?: string;
  address?: string;
  status: string;
}
