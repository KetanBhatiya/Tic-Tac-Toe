import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1738047302603 implements MigrationInterface {
  name = "Initial1738047302603";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "wins" integer NOT NULL DEFAULT '0', "losses" integer NOT NULL DEFAULT '0', "draws" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "game_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "boardState" text NOT NULL, "isDraw" boolean NOT NULL DEFAULT false, "spectators" text, "roomId" uuid, "currentTurnId" uuid, "winnerId" uuid, CONSTRAINT "REL_1cd97279c270ad441b2d54cf72" UNIQUE ("roomId"), CONSTRAINT "PK_58b630233711ccafbb0b2a904fc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game_room_status_enum" AS ENUM('waiting', 'active', 'finished')`
    );
    await queryRunner.query(
      `CREATE TABLE "game_room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roomName" character varying NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, "joinCode" character varying, "status" "public"."game_room_status_enum" NOT NULL DEFAULT 'waiting', "createdById" uuid, "player2Id" uuid, CONSTRAINT "PK_fa4083cccb79a3e4786a991000b" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" ADD CONSTRAINT "FK_1cd97279c270ad441b2d54cf725" FOREIGN KEY ("roomId") REFERENCES "game_room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" ADD CONSTRAINT "FK_46ee61cfab15b1e0c0aefe175cb" FOREIGN KEY ("currentTurnId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" ADD CONSTRAINT "FK_089a527796258ca3c65ce437a15" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "game_room" ADD CONSTRAINT "FK_217a710c48babf8090f0ecfa1a6" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "game_room" ADD CONSTRAINT "FK_da67742fdba1c16778b9e3e351f" FOREIGN KEY ("player2Id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "game_room" DROP CONSTRAINT "FK_da67742fdba1c16778b9e3e351f"`
    );
    await queryRunner.query(
      `ALTER TABLE "game_room" DROP CONSTRAINT "FK_217a710c48babf8090f0ecfa1a6"`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" DROP CONSTRAINT "FK_089a527796258ca3c65ce437a15"`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" DROP CONSTRAINT "FK_46ee61cfab15b1e0c0aefe175cb"`
    );
    await queryRunner.query(
      `ALTER TABLE "game_session" DROP CONSTRAINT "FK_1cd97279c270ad441b2d54cf725"`
    );
    await queryRunner.query(`DROP TABLE "game_room"`);
    await queryRunner.query(`DROP TYPE "public"."game_room_status_enum"`);
    await queryRunner.query(`DROP TABLE "game_session"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
