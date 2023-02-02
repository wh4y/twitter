const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordIsQuoteInsteadOfIsRetweet1675339500289 {
    name = 'recordIsQuoteInsteadOfIsRetweet1675339500289'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" RENAME COLUMN "isRetweet" TO "isQuote"`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "twitter_record" RENAME COLUMN "isQuote" TO "isRetweet"`);
    }
}
