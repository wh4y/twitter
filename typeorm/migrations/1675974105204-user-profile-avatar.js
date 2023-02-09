const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userProfileAvatar1675974105204 {
    name = 'userProfileAvatar1675974105204'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user_profile_avatar" ("profileId" uuid NOT NULL, "path" character varying, "name" character varying NOT NULL, CONSTRAINT "REL_9a3f482a0b2aa25affbf1bf594" UNIQUE ("profileId"), CONSTRAINT "PK_9a3f482a0b2aa25affbf1bf5940" PRIMARY KEY ("profileId"))`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD "avatarProfileId" uuid`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_6e44412484ac9b3a645d5301d72" UNIQUE ("avatarProfileId")`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" ADD CONSTRAINT "FK_9a3f482a0b2aa25affbf1bf5940" FOREIGN KEY ("profileId") REFERENCES "user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profile" ADD CONSTRAINT "FK_6e44412484ac9b3a645d5301d72" FOREIGN KEY ("avatarProfileId") REFERENCES "user_profile_avatar"("profileId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_6e44412484ac9b3a645d5301d72"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "FK_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile_avatar" DROP CONSTRAINT "FK_9a3f482a0b2aa25affbf1bf5940"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_51cb79b5555effaf7d69ba1cff9"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP CONSTRAINT "UQ_6e44412484ac9b3a645d5301d72"`);
        await queryRunner.query(`ALTER TABLE "user_profile" DROP COLUMN "avatarProfileId"`);
        await queryRunner.query(`DROP TABLE "user_profile_avatar"`);
    }
}
