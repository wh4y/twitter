const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class treeTypeMatherializedPath1673871969986 {
    name = 'treeTypeMatherializedPath1673871969986'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "nsleft"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "nsright"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "mpath" character varying DEFAULT ''`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" DROP COLUMN "mpath"`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "nsright" integer NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "twitter_record_entity" ADD "nsleft" integer NOT NULL DEFAULT '1'`);
    }
}
