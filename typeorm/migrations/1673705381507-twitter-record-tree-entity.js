const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordTreeEntity1673705381507 {
    name = 'twitterRecordTreeEntity1673705381507'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "nsleft" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "nsright" integer NOT NULL DEFAULT '2'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "nsright"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "nsleft"`);
    }
}
