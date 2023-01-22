const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecord1674331018941 {
    name = 'twitterRecord1674331018941'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "twitter_record" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "authorId" uuid NOT NULL, "isComment" boolean NOT NULL DEFAULT false, "isRetweet" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL, "parentRecordId" uuid, "text" character varying, "mpath" character varying DEFAULT '', CONSTRAINT "PK_dd14ce61179855a4817a772966d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "twitter_record_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, "name" character varying NOT NULL, "recordId" uuid, CONSTRAINT "PK_1cb9061979a274a3529af0e5f55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_377bde167470718938a4b530e32" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ADD CONSTRAINT "FK_4d6d4466d862f35043408b38be6" FOREIGN KEY ("parentRecordId") REFERENCES "twitter_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "twitter_record_image" ADD CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image" DROP CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_4d6d4466d862f35043408b38be6"`);
        await queryRunner.query(`ALTER TABLE "twitter_record" DROP CONSTRAINT "FK_377bde167470718938a4b530e32"`);
        await queryRunner.query(`DROP TABLE "twitter_record_image"`);
        await queryRunner.query(`DROP TABLE "twitter_record"`);
    }
}
