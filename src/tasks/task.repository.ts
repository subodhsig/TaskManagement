import { DataSource, Repository } from 'typeorm';
import { Task } from './task.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { User } from 'src/auth/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TasksRepository extends Repository<Task> {
  private logger = new Logger('TasksRepository');
  constructor(dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async findPending(): Promise<Task[]> {
    return await this.findBy({ status: TaskStatus.OPEN });
  }
  async getTasks(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    const { search, status } = filterDto;

    const query = this.createQueryBuilder('task');

    query.where({ user });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      this.logger.error(
        `Failed to fetch data from db by ${user.username}. Filters ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.save(task);
    return task;
  }
}
