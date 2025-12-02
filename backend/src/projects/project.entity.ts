export interface ProjectItem {
  itemTypeId: number;
  quantity: number;
}

export class Project {
  id: number;
  name: string;
  maxWeight: number;
  maxVolume: number;
  items: ProjectItem[];
}
