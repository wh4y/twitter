const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordImagePathNullable1675363265221 {
    name = 'recordImagePathNullable1675363265221'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image" ALTER COLUMN "path" DROP NOT NULL`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_image" ALTER COLUMN "path" SET NOT NULL`);
    }
}
