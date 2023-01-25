const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class imageOnDeleteCascade1674657929664 {
    name = 'imageOnDeleteCascade1674657929664'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image" DROP CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_image" ADD CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image" DROP CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_image" ADD CONSTRAINT "FK_e634e5aa4796c5a57a5b3c6bdac" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
