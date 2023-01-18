const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordImages1673443926857 {
    name = 'twitterRecordImages1673443926857'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "twitter_record_image_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, "name" character varying NOT NULL, "recordId" uuid, CONSTRAINT "PK_ef97540b8b4f1cc5161a8c738a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "twitter_record_image_entity" ADD CONSTRAINT "FK_5f87b3a48d5a0869221c23c07e0" FOREIGN KEY ("recordId") REFERENCES "twitter_record_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image_entity" DROP CONSTRAINT "FK_5f87b3a48d5a0869221c23c07e0"`);
        await queryRunner.query(`DROP TABLE "twitter_record_image_entity"`);
    }
}
