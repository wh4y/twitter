const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatFounderAndInterlocutorRemoved1676977820154 {
    name = 'chatFounderAndInterlocutorRemoved1676977820154'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_d8e9d0c7120916d97506d09e131"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_1687bcb4168e0de91d1fe6e3729"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "UQ_d8e9d0c7120916d97506d09e131"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "founderId"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "UQ_1687bcb4168e0de91d1fe6e3729"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "interlocutorId"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" ADD "interlocutorId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "UQ_1687bcb4168e0de91d1fe6e3729" UNIQUE ("interlocutorId")`);
        await queryRunner.query(`ALTER TABLE "chat" ADD "founderId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "UQ_d8e9d0c7120916d97506d09e131" UNIQUE ("founderId")`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_1687bcb4168e0de91d1fe6e3729" FOREIGN KEY ("interlocutorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_d8e9d0c7120916d97506d09e131" FOREIGN KEY ("founderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
