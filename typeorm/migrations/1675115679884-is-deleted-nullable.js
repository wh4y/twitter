const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class isDeletedNullable1675115679884 {
    name = 'isDeletedNullable1675115679884'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" DROP DEFAULT`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" SET NOT NULL`);
    }
}
