const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordCreatedAt1674331155466 {
    name = 'twitterRecordCreatedAt1674331155466'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "createdAt" DROP DEFAULT`);
    }
}
