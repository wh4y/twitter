const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordEntity1673438506023 {
    name = 'twitterRecordEntity1673438506023'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "twitter_record_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" uuid NOT NULL, "isComment" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL, "parentRecordId" uuid, CONSTRAINT "REL_04fa47f857cd0eed1613ed83dd" UNIQUE ("authorId"), CONSTRAINT "PK_9487480a2d43c467f03e0750598" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0" FOREIGN KEY ("authorId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD CONSTRAINT "FK_8e3c6c9ccf740cf78a46ad6b62f" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP CONSTRAINT "FK_8e3c6c9ccf740cf78a46ad6b62f"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0"`);
        await queryRunner.query(`DROP TABLE "twitter_record_entity"`);
    }
}
