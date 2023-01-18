const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordEntityText1673439448453 {
    name = 'twitterRecordEntityText1673439448453'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "text" character varying`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "text"`);
    }
}
