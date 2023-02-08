const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordCommentsCount1675798533622 {
    name = 'recordCommentsCount1675798533622'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD "commentsCount" integer NOT NULL DEFAULT '0'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP COLUMN "commentsCount"`);
    }
}
