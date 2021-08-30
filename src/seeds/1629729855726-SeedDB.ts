import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDB1629729855726 implements MigrationInterface {
    name = 'SeedDB1629729855726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`);

        await queryRunner.query(`INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$DWWwKCGKOjqJUXPfAj40yeC28QZx.huy5F3HSZ3aNfUQYXiBI0N3e')`);

        await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first', 'first', 'first', 'first', 'coffee,dragons', 1)`);

        await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second', 'second', 'second', 'second', 'coffee,dragons', 1)`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {}

}
