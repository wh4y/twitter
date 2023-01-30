const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class isAreVisibleForFollowersOnly1675074149397 {
    name = 'isAreVisibleForFollowersOnly1675074149397'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" RENAME COLUMN "isOpenForFollowersOnly" TO "isVisibleForFollowersOnly"`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" ADD "areVisibleForFollowersOnly" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" DROP COLUMN "areVisibleForFollowersOnly"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" RENAME COLUMN "isVisibleForFollowersOnly" TO "isOpenForFollowersOnly"`);
    }
}
