import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ItemTypesModule } from './item-types/item-types.module';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, ItemTypesModule],
})
export class AppModule {}
