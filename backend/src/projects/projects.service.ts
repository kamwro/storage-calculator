import { Injectable, NotFoundException } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ItemTypesService } from '../item-types/item-types.service';

@Injectable()
export class ProjectsService {
  private projects: Project[] = [];
  private nextId = 1;

  constructor(private readonly itemTypesService: ItemTypesService) {}

  findAll(): Project[] {
    return this.projects;
  }

  findOne(id: number): Project {
    const project = this.projects.find((p) => p.id === id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto): Project {
    const project: Project = {
      id: this.nextId++,
      ...dto,
    };
    this.projects.push(project);
    return project;
  }

  update(id: number, dto: UpdateProjectDto): Project {
    const project = this.findOne(id);
    Object.assign(project, dto);
    return project;
  }

  remove(id: number): void {
    this.projects = this.projects.filter((p) => p.id !== id);
  }

  calculate(id: number) {
    const project = this.findOne(id);

    let totalWeight = 0;
    let totalVolume = 0;

    for (const item of project.items) {
      const itemType = this.itemTypesService.findById(item.itemTypeId);
      totalWeight += item.quantity * itemType.weightPerUnit;
      totalVolume += item.quantity * itemType.volumePerUnit;
    }

    const weightExceeded = totalWeight > project.maxWeight;
    const volumeExceeded = totalVolume > project.maxVolume;

    return {
      projectId: project.id,
      totalWeight,
      totalVolume,
      maxWeight: project.maxWeight,
      maxVolume: project.maxVolume,
      weightExceeded,
      volumeExceeded,
    };
  }
}
