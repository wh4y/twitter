const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class interlocutorAdded1676889557829 {
    name = 'interlocutorAdded1676889557829'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" ADD "interlocutorId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "UQ_1687bcb4168e0de91d1fe6e3729" UNIQUE ("interlocutorId")`);
        await queryRunner.query(`ALTER TABLE "chat" ADD CONSTRAINT "FK_1687bcb4168e0de91d1fe6e3729" FOREIGN KEY ("interlocutorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "FK_1687bcb4168e0de91d1fe6e3729"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP CONSTRAINT "UQ_1687bcb4168e0de91d1fe6e3729"`);
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "interlocutorId"`);
    }
}
