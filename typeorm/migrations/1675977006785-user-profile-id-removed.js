const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userProfileIdRemoved1675977006785 {
    name = 'userProfileIdRemoved1675977006785'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_6e44412484ac9b3a645d5301d72"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "FK_9a3f482a0b2aa25affbf1bf5940"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_6e44412484ac9b3a645d5301d72"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "avatarProfileId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "PK_9a3f482a0b2aa25affbf1bf5940"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "profileId"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "avatarId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_380944e25224bc584e658d6cf91" UNIQUE ("avatarId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "PK_3c011f4eefd39da06c16ace49a2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "profileUserId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "UQ_79c4d9fd6fcf4a8ca7ae494008d" UNIQUE ("profileUserId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "PK_51cb79b5555effaf7d69ba1cff9" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_380944e25224bc584e658d6cf91" FOREIGN KEY ("avatarId") REFERENCES "user_profile_avatar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "FK_79c4d9fd6fcf4a8ca7ae494008d" FOREIGN KEY ("profileUserId") REFERENCES "user_profile"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "FK_79c4d9fd6fcf4a8ca7ae494008d"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_380944e25224bc584e658d6cf91"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "PK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "UQ_79c4d9fd6fcf4a8ca7ae494008d"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "profileUserId"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "PK_3c011f4eefd39da06c16ace49a2"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_380944e25224bc584e658d6cf91"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "avatarId"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD "profileId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "PK_9a3f482a0b2aa25affbf1bf5940" PRIMARY KEY ("profileId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "avatarProfileId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_6e44412484ac9b3a645d5301d72" UNIQUE ("avatarProfileId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "FK_9a3f482a0b2aa25affbf1bf5940" FOREIGN KEY ("profileId") REFERENCES "user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_6e44412484ac9b3a645d5301d72" FOREIGN KEY ("avatarProfileId") REFERENCES "user_profile_avatar"("profileId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
