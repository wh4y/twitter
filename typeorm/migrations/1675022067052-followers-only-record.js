const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class followersOnlyRecord1675022067052 {
    name = 'followersOnlyRecord1675022067052'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" ADD "isOpenForFollowersOnly" boolean NOT NULL DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" DROP COLUMN "isOpenForFollowersOnly"`);
    }
}
