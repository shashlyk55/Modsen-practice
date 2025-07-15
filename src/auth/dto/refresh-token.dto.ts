export class RefreshTokenDTO {
	constructor(refreshToken: string) {
		this.refreshToken = refreshToken;
	}

	refreshToken: string;
}
