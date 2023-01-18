const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userAndRefreshToken1673304682413 {
    name = 'userAndRefreshToken1673304682413'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_3fe76ecf0f0ef036ff981e9f67d" UNIQUE ("name"), CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token_entity" ("token" character varying NOT NULL, "userId" uuid NOT NULL, "sessionId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_19145ef8b94a816631fd4206a8a" PRIMARY KEY ("token"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "refresh_token_entity"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
    }
}
