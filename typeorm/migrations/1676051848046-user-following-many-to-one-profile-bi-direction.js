const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userFollowingManyToOneProfileBiDirection1676051848046 {
    name = 'userFollowingManyToOneProfileBiDirection1676051848046'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "FK_79c4d9fd6fcf4a8ca7ae494008d"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_380944e25224bc584e658d6cf91"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "PK_3c011f4eefd39da06c16ace49a2"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "UQ_79c4d9fd6fcf4a8ca7ae494008d"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "profileUserId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_380944e25224bc584e658d6cf91"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "avatarId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "followingsCount"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "followersCount"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "PK_b5eabff4cb0909c9c643f6431c0" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "UQ_b5eabff4cb0909c9c643f6431c0" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "FK_b5eabff4cb0909c9c643f6431c0" FOREIGN KEY ("userId") REFERENCES "user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "FK_b5eabff4cb0909c9c643f6431c0"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "UQ_b5eabff4cb0909c9c643f6431c0"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "PK_b5eabff4cb0909c9c643f6431c0"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "followersCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "followingsCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "avatarId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_380944e25224bc584e658d6cf91" UNIQUE ("avatarId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "profileUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "UQ_79c4d9fd6fcf4a8ca7ae494008d" UNIQUE ("profileUserId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "PK_3c011f4eefd39da06c16ace49a2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_380944e25224bc584e658d6cf91" FOREIGN KEY ("avatarId") REFERENCES "user_profile_avatar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "FK_79c4d9fd6fcf4a8ca7ae494008d" FOREIGN KEY ("profileUserId") REFERENCES "user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
