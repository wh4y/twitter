const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordIsRetweetRemoved1674601058509 {
    name = 'twitterRecordIsRetweetRemoved1674601058509'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "isRetweet"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "isRetweet" boolean NOT NULL DEFAULT false`);
    }
}
