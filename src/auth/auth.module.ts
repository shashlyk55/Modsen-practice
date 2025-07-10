import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AccessTokenStrategy } from './strategy/access-token.strategy';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
	imports: [UsersModule, PassportModule, JwtModule, SessionsModule],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtService,
		RefreshTokenStrategy,
		AccessTokenStrategy,
	],
	exports: [AuthService],
})
export class AuthModule {}
