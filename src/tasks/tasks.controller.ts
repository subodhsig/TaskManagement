import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-task-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status';
import { Task } from './task.entity';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorators';
import { Logger } from '@nestjs/common';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}
  @Get()
  getTasks(
    @Query() filterDto: GetTaskFilterDto,
    @GetUser()
    user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User ${user.username} retrivinf all task. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.tasksService.getTasks(filterDto, user);
  }

  // @Get('/:id')
  // getTaskById(@Param('id') id: string): Task {
  //   return this.tasksService.getTaskById(id);
  // }

  @Get('/:id')
  getTaskById(
    @Param('id') id: string,
    @GetUser()
    user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  // @Delete('/:id')
  // deleteTask(@Param('id') id: string): { message: string } {
  //   this.tasksService.deleteTask(id);
  //   return { message: `Task deleted successfully` };
  // }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  @Post()
  createTask(
    @Body()
    createTaskDto: CreateTaskDto,
    @GetUser()
    user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User ${user.username} creating a task. data:${JSON.stringify}`,
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  // @Patch('/:id/status')
  // updateTaskStatus(
  //   @Param('id') id: string,
  //   @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  // ): Task {
  //   const { status } = updateTaskStatusDto;
  //   return this.tasksService.updateTaskStatus(id, status);
  // }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
