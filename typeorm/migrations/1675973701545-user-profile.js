const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userProfile1675973701545 {
    name = 'userProfile1675973701545'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "user_profile"`);
    }
}
