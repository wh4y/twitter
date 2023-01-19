const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class refreshToken1674137586236 {
    name = 'refreshToken1674137586236'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("value" character varying NOT NULL, "userId" uuid NOT NULL, "sessionId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_4f310b2b1f45ec02710a7193611" PRIMARY KEY ("sessionId"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }
}
