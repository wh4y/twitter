const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatMessageCreatedAt1677161295719 {
    name = 'chatMessageCreatedAt1677161295719'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "message" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "message" DROP COLUMN "createdAt"`);
    }
}
