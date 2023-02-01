const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordParentDeleteCascade1675280848674 {
    name = 'recordParentDeleteCascade1675280848674'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_4d6d4466d862f35043408b38be6"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_4d6d4466d862f35043408b38be6" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_4d6d4466d862f35043408b38be6"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_4d6d4466d862f35043408b38be6" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}
