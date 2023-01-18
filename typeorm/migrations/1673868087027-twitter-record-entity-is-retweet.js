const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordEntityIsRetweet1673868087027 {
    name = 'twitterRecordEntityIsRetweet1673868087027'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "isRetweet" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "isRetweet"`);
    }
}
