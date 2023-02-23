const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatMemberCreatedAt1677184335914 {
    name = 'chatMemberCreatedAt1677184335914'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" DROP COLUMN "createdAt"`);
    }
}
