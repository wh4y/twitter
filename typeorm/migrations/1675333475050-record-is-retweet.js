const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordIsRetweet1675333475050 {
    name = 'recordIsRetweet1675333475050'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "isRetweet" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "isRetweet"`);
    }
}
