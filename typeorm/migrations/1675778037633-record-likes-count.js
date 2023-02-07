const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordLikesCount1675778037633 {
    name = 'recordLikesCount1675778037633'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "likesCount" character varying NOT NULL DEFAULT '0'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "likesCount"`);
    }
}
