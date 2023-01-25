const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class recordsPrivacySettings1674599888726 {
    name = 'recordsPrivacySettings1674599888726'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "record_privacy_settings" ("recordId" uuid NOT NULL, "isCommentingAllowed" boolean NOT NULL DEFAULT true, "isHidden" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_63b89ff008b3758ad77293c8bb" UNIQUE ("recordId"), CONSTRAINT "PK_63b89ff008b3758ad77293c8bb8" PRIMARY KEY ("recordId"))`);
        await queryRunner.query(`CREATE TABLE "user_records_privacy_settings" ("userId" uuid NOT NULL, "isCommentingAllowed" boolean NOT NULL DEFAULT true, "areHidden" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_b640cbd86896b541dd387e92a4" UNIQUE ("userId"), CONSTRAINT "PK_b640cbd86896b541dd387e92a4f" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "rec_pri_set_use_exc_fro_com_rul_use" ("recordPrivacySettingsRecordId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_3d98486cfde602609fb96a9bc11" PRIMARY KEY ("recordPrivacySettingsRecordId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e3bdc81e2c163b2c9850728b9" ON "rec_pri_set_use_exc_fro_com_rul_use" ("recordPrivacySettingsRecordId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c69ecde987d797c9d60c341b43" ON "rec_pri_set_use_exc_fro_com_rul_use" ("userId") `);
        await queryRunner.query(`CREATE TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" ("recordPrivacySettingsRecordId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_131aaa11fed212267b4a677125c" PRIMARY KEY ("recordPrivacySettingsRecordId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4bee8992a3849c2c4dc2703d0b" ON "record_privacy_settings_users_excepted_from_viewing_rules_user" ("recordPrivacySettingsRecordId") `);
        await queryRunner.query(`CREATE INDEX "IDX_af667166ae0ee28bf25e60f260" ON "record_privacy_settings_users_excepted_from_viewing_rules_user" ("userId") `);
        await queryRunner.query(`CREATE TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" ("userRecordsPrivacySettingsUserId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_cc314703121ee7aca31024df46f" PRIMARY KEY ("userRecordsPrivacySettingsUserId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1dabd69e114c414a763c7a804f" ON "use_rec_pri_set_use_exc_fro_com_rul_use" ("userRecordsPrivacySettingsUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_79ae78464211d4f198151b632f" ON "use_rec_pri_set_use_exc_fro_com_rul_use" ("userId") `);
        await queryRunner.query(`CREATE TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" ("userRecordsPrivacySettingsUserId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_61d860963c26d4c5288b732b3a9" PRIMARY KEY ("userRecordsPrivacySettingsUserId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1c1b86ac97d6955ebb6d2ff120" ON "use_rec_pri_set_use_exc_fro_vie_rul_use" ("userRecordsPrivacySettingsUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ceeb38dc823c1e23fdd6ef5c4c" ON "use_rec_pri_set_use_exc_fro_vie_rul_use" ("userId") `);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" ADD CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8" FOREIGN KEY ("recordId") REFERENCES "twitter_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" ADD CONSTRAINT "FK_b640cbd86896b541dd387e92a4f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_c69ecde987d797c9d60c341b43b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" ADD CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be" FOREIGN KEY ("recordPrivacySettingsRecordId") REFERENCES "record_privacy_settings"("recordId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" ADD CONSTRAINT "FK_af667166ae0ee28bf25e60f260c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_1dabd69e114c414a763c7a804f1" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" ADD CONSTRAINT "FK_79ae78464211d4f198151b632f3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" ADD CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200" FOREIGN KEY ("userRecordsPrivacySettingsUserId") REFERENCES "user_records_privacy_settings"("userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" ADD CONSTRAINT "FK_ceeb38dc823c1e23fdd6ef5c4c4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" DROP CONSTRAINT "FK_ceeb38dc823c1e23fdd6ef5c4c4"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use" DROP CONSTRAINT "FK_1c1b86ac97d6955ebb6d2ff1200"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_79ae78464211d4f198151b632f3"`);
        await queryRunner.query(`ALTER TABLE "use_rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1dabd69e114c414a763c7a804f1"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" DROP CONSTRAINT "FK_af667166ae0ee28bf25e60f260c"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user" DROP CONSTRAINT "FK_4bee8992a3849c2c4dc2703d0be"`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_c69ecde987d797c9d60c341b43b"`);
        await queryRunner.query(`ALTER TABLE "rec_pri_set_use_exc_fro_com_rul_use" DROP CONSTRAINT "FK_1e3bdc81e2c163b2c9850728b9a"`);
        await queryRunner.query(`ALTER TABLE "user_records_privacy_settings" DROP CONSTRAINT "FK_b640cbd86896b541dd387e92a4f"`);
        await queryRunner.query(`ALTER TABLE "record_privacy_settings" DROP CONSTRAINT "FK_63b89ff008b3758ad77293c8bb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ceeb38dc823c1e23fdd6ef5c4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c1b86ac97d6955ebb6d2ff120"`);
        await queryRunner.query(`DROP TABLE "use_rec_pri_set_use_exc_fro_vie_rul_use"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79ae78464211d4f198151b632f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1dabd69e114c414a763c7a804f"`);
        await queryRunner.query(`DROP TABLE "use_rec_pri_set_use_exc_fro_com_rul_use"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af667166ae0ee28bf25e60f260"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bee8992a3849c2c4dc2703d0b"`);
        await queryRunner.query(`DROP TABLE "record_privacy_settings_users_excepted_from_viewing_rules_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c69ecde987d797c9d60c341b43"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e3bdc81e2c163b2c9850728b9"`);
        await queryRunner.query(`DROP TABLE "rec_pri_set_use_exc_fro_com_rul_use"`);
        await queryRunner.query(`DROP TABLE "user_records_privacy_settings"`);
        await queryRunner.query(`DROP TABLE "record_privacy_settings"`);
    }
}
