const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatMemberRemovedAutogeneratedId1676984696799 {
    name = 'chatMemberRemovedAutogeneratedId1676984696799'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" DROP CONSTRAINT "PK_2aad8c13481bba9b43eaa2a774f"`);
        await queryRunner.query(`ALTER TABLE "chat_member" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "chat_member" ADD CONSTRAINT "PK_19ebaef9771578d9922a3291b82" PRIMARY KEY ("chatId", "userId")`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" DROP CONSTRAINT "PK_19ebaef9771578d9922a3291b82"`);
        await queryRunner.query(`ALTER TABLE "chat_member" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "chat_member" ADD CONSTRAINT "PK_2aad8c13481bba9b43eaa2a774f" PRIMARY KEY ("id")`);
    }
}
