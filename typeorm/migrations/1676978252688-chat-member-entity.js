const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatMemberEntity1676978252688 {
    name = 'chatMemberEntity1676978252688'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "chat_member" ("chatId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_19ebaef9771578d9922a3291b82" PRIMARY KEY ("chatId", "userId"))`);
        await queryRunner.query(`ALTER TABLE "chat_member" ADD CONSTRAINT "FK_92e48cf204fcce7febc738c8d6f" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_member" ADD CONSTRAINT "FK_0b7f67b9d8726c419922462e848" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat_member" DROP CONSTRAINT "FK_0b7f67b9d8726c419922462e848"`);
        await queryRunner.query(`ALTER TABLE "chat_member" DROP CONSTRAINT "FK_92e48cf204fcce7febc738c8d6f"`);
        await queryRunner.query(`DROP TABLE "chat_member"`);
    }
}
