const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordLikesCountInt1675779752432 {
    name = 'recordLikesCountInt1675779752432'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "likesCount"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "likesCount" integer NOT NULL DEFAULT '0'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "likesCount"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "likesCount" character varying NOT NULL DEFAULT '0'`);
    }
}
