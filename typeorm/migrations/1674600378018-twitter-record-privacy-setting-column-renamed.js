const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class twitterRecordPrivacySettingColumnRenamed1674600378018 {
    name = 'twitterRecordPrivacySettingColumnRenamed1674600378018'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" DROP CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8"`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" DROP CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" ADD CONSTRAINT "UQ_63b89ff008b3758ad77293c8bb8" UNIQUE ("recordId")`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" DROP CONSTRAINT "FK_b640cbd86896b541dd387e92a4f"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1dabd69e114c414a763c7a804f1"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" DROP CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200"`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" ADD CONSTRAINT "UQ_b640cbd86896b541dd387e92a4f" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" ADD CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" ADD CONSTRAINT "FK_b640cbd86896b541dd387e92a4f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" ADD CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1dabd69e114c414a763c7a804f1" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" ADD CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" DROP CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1dabd69e114c414a763c7a804f1"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" DROP CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be"`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a"`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" DROP CONSTRAINT "FK_b640cbd86896b541dd387e92a4f"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" DROP CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8"`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" DROP CONSTRAINT "UQ_b640cbd86896b541dd387e92a4f"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" ADD CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1dabd69e114c414a763c7a804f1" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" ADD CONSTRAINT "FK_b640cbd86896b541dd387e92a4f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" DROP CONSTRAINT "UQ_63b89ff008b3758ad77293c8bb8"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" ADD CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" ADD CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
