import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { hash } from 'bcrypt';
import { ArticleEntity } from "@app/article/article.entity";

@Entity({name: 'users'})
export class UserEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email:string;

    @Column({default: ''})
    bio: string;

    @Column({default: ''})
    img: string;

    @Column({select: false})
    password: string;

    @OneToMany(() => ArticleEntity, (article) => article.author)
    articles: ArticleEntity[];

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10);
    }
}

