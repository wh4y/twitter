const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordIsDeleted1674842701157 {
    name = 'twitterRecordIsDeleted1674842701157'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "isDeleted"`);
    }
}
