import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
export const { ObserveModule, ObserveInstrument } = createObserveModule();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().port().default(5432),
        DATABASE_USER: Joi.string().default('postgres'),
        DATABASE_PASSWORD: Joi.string().allow('').required(),
        DATABASE_NAME: Joi.string().default('library'),
        DATABASE_SYNCHRONIZE: Joi.boolean().default(true),
      }),
    }),
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'librarybooks-api',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('DATABASE_SYNCHRONIZE'),
      }),
    }),
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
