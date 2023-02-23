const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class chatType1676889841385 {
    name = 'chatType1676889841385'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" ADD "type" character varying NOT NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "chat" DROP COLUMN "type"`);
    }
}
