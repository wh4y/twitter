const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userRole1674048176496 {
    name = 'userRole1674048176496'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_entity_roles_role" ("userEntityId" uuid NOT NULL, "roleId" uuid NOT NULL, CONSTRAINT "PK_1eb0c4d879c2e0866b09ed0c3ee" PRIMARY KEY ("userEntityId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1d7a446141f20f93dde65cd390" ON "user_entity_roles_role" ("userEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c99d2cee7f2dbae3311fa0d7dc" ON "user_entity_roles_role" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "user_entity_roles_role" ADD CONSTRAINT "FK_1d7a446141f20f93dde65cd3908" FOREIGN KEY ("userEntityId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_entity_roles_role" ADD CONSTRAINT "FK_c99d2cee7f2dbae3311fa0d7dca" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_entity_roles_role" DROP CONSTRAINT "FK_c99d2cee7f2dbae3311fa0d7dca"`);
        await queryRunner.query(`ALTER TABLE "user_entity_roles_role" DROP CONSTRAINT "FK_1d7a446141f20f93dde65cd3908"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c99d2cee7f2dbae3311fa0d7dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1d7a446141f20f93dde65cd390"`);
        await queryRunner.query(`DROP TABLE "user_entity_roles_role"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }
}
