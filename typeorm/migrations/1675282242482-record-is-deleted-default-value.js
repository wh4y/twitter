const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordIsDeletedDefaultValue1675282242482 {
    name = 'recordIsDeletedDefaultValue1675282242482'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" SET DEFAULT false`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" ALTER COLUMN "isDeleted" DROP DEFAULT`);
    }
}
