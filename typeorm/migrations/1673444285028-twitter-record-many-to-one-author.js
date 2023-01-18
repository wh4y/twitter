const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordManyToOneAuthor1673444285028 {
    name = 'twitterRecordManyToOneAuthor1673444285028'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP CONSTRAINT "REL_04fa47f857cd0eed1613ed83dd"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0" FOREIGN KEY ("authorId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD CONSTRAINT "REL_04fa47f857cd0eed1613ed83dd" UNIQUE ("authorId")`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD CONSTRAINT "FK_04fa47f857cd0eed1613ed83dd0" FOREIGN KEY ("authorId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
