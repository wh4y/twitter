const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userProfileFollowerAndFollowingsCount1675979803388 {
    name = 'userProfileFollowerAndFollowingsCount1675979803388'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "followingsCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "followersCount" integer NOT NULL DEFAULT '0'`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "followersCount"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "followingsCount"`);
    }
}
