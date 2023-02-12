const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordLikesCountRemoved1676057605211 {
    name = 'twitterRecordLikesCountRemoved1676057605211'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "likesCount"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "commentsCount"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "commentsCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "likesCount" integer NOT NULL DEFAULT '0'`);
    }
}
