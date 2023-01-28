const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordOnDeleteSetNull1674839167095 {
    name = 'twitterRecordOnDeleteSetNull1674839167095'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_4d6d4466d862f35043408b38be6"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_4d6d4466d862f35043408b38be6" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_4d6d4466d862f35043408b38be6"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_4d6d4466d862f35043408b38be6" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
