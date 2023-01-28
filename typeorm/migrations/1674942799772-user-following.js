const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class userFollowing1674942799772 {
    name = 'userFollowing1674942799772'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "user_following" ("followerId" uuid NOT NULL, "followedUserId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2da63befae7006cf3be9210b914" PRIMARY KEY ("followerId", "followedUserId"))`);
        await queryRunner.query(`ALTER TABLE "user_following" ADD CONSTRAINT "FK_a2dce8d9c1c4b5cbc8d6e5fc399" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_following" ADD CONSTRAINT "FK_fd259654ef1e3dc21aff7e217bb" FOREIGN KEY ("followedUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_following" DROP CONSTRAINT "FK_fd259654ef1e3dc21aff7e217bb"`);
        await queryRunner.query(`ALTER TABLE "user_following" DROP CONSTRAINT "FK_a2dce8d9c1c4b5cbc8d6e5fc399"`);
        await queryRunner.query(`DROP TABLE "user_following"`);
    }
}
