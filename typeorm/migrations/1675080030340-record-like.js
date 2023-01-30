const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordLike1675080030340 {
    name = 'recordLike1675080030340'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "record_like" ("recordId" uuid NOT NULL, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_402286a5593400b4c9ab37457bb" PRIMARY KEY ("recordId", "userId"))`);
        await queryRunner.query(`ALTER TABLE "record_like" ADD CONSTRAINT "FK_d27e6a55fb72cdd641dbfe84b76" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "record_like" ADD CONSTRAINT "FK_96152385193032943faceeb5439" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "record_like" DROP CONSTRAINT "FK_96152385193032943faceeb5439"`);
        await queryRunner.query(`ALTER TABLE "record_like" DROP CONSTRAINT "FK_d27e6a55fb72cdd641dbfe84b76"`);
        await queryRunner.query(`DROP TABLE "record_like"`);
    }
}
