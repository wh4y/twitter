const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatMemberRole1677174411728 {
    name = 'chatMemberRole1677174411728'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" ADD "role" character varying NOT NULL DEFAULT 'ORDINARY_MEMBER'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" DROP COLUMN "role"`);
    }
}
