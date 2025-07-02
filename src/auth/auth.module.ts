import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStartegy } from './strategy/access-token.strategy';
import { SessionService } from './session.service';
import { Session } from 'src/entities/session.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule,
		TypeOrmModule.forFeature([Session]),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtService,
		LocalStrategy,
		RefreshTokenStrategy,
		AccessTokenStartegy,
		SessionService,
	],
	exports: [AuthService],
})
export class AuthModule {}
