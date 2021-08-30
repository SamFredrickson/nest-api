import { UserEntity } from "@app/user/user.entity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ArticleEntity } from "./article.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { Repository, DeleteResult, getRepository } from "typeorm";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import slugify from 'slugify';
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { FollowEntity } from "@app/profile/follow.entity";

@Injectable()
export class ArticleService {

    constructor(
        @InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>

    ) {}

    async create(user: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        Object.assign(article, createArticleDto);

        if( ! article.tagList)
            article.tagList = [];

        article.author = user;

        article.slug = this.getSlug(createArticleDto.title);

        return await this.articleRepository.save(article);
    }

    async getBySlug(slug: string)
    {
        if( ! slug )
            throw new 
                HttpException('Slug is required', HttpStatus.UNPROCESSABLE_ENTITY);

        const article = this.articleRepository.findOne({ slug });
        return article;
    }

    async delete(slug: string, userId: number): Promise<DeleteResult>
    {
        const article = await this.getBySlug(slug);

        if( ! article )
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);

        if (article.author.id !== userId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        return await this.articleRepository.delete({slug});
    }

    async update(userId: number, slug: string, updateArticleDto: CreateArticleDto): Promise<ArticleEntity>
    {
        const article = await this.getBySlug(slug);

        if( ! article )
            throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);

        if (article.author.id !== userId) {
            throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
        }

        Object.assign(article, updateArticleDto);

        return await this.articleRepository.save(article);

    }

    async all(userId: number, query: any): Promise<ArticlesResponseInterface>
    {
        const queryBuilder = 
         getRepository(ArticleEntity)
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.author', 'author')

        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if(query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`
            });
        }

        if(query.author) {

            const author = await this.userRepository.findOne({
                username: query.author,
            });

            queryBuilder.andWhere('articles.authorId = :id', {
                id: author.id
            });
        }

        if(query.limit)
            queryBuilder.limit(query.limit);

        if(query.offset)
            queryBuilder.offset(query.offset);

        if(query.favorited) {
            const user = await this.userRepository.findOne({
                username: query.favorited
            }, {
                relations: ['favorites']
            });

            const ids = user.favorites.map(el => el.id);

            if(ids.length > 0) {
                queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
            } else {
                queryBuilder.andWhere('1=0');
            }
        }

        let favoriteIds: number[] = [];

        if(userId) {
            const currentUser = await this.userRepository
            .findOne(userId, {
                relations: ['favorites']
            });

            favoriteIds = currentUser.favorites.map(fav => fav.id);
        }

        const articles = await queryBuilder.getMany();
        const articlesWithFavorites = articles.map(article => {
            const favorited = favoriteIds.includes(article.id);
            return {...article, favorited}
        });

        return {articles: articlesWithFavorites, articlesCount};
    }

    async getFeed(userId: number, query: any): Promise<ArticlesResponseInterface>
    {
        const follows = await this.followRepository.find({
            followerId: userId,
        });

        if(follows.length === 0) {
            return { articles: [], articlesCount: 0 }
        }

        const followingUserIds = follows
        .map(follow => follow.followingId);
        
        const queryBuilder = getRepository(ArticleEntity)
        .createQueryBuilder('articles')
        .leftJoinAndSelect('articles.author', 'author')
        .where('articles.authorId IN (:...ids)', {ids: followingUserIds});

        queryBuilder
        .orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if(query.limit)
            queryBuilder.limit(query.limit);

        if(query.offset)
            queryBuilder.limit(query.offset);

        const articles = await queryBuilder.getMany();

        return {
            articles,
            articlesCount
        };
    }

    async addToFavorites(userId: number, slug: string): Promise<ArticleEntity>
    {
        const article = await this.getBySlug(slug);
        const user = await this.userRepository.findOne(userId, {
            relations: ['favorites'],
        });

        const isNotFavorited = user.favorites
        .findIndex(articleInFavorites => articleInFavorites.id === article.id) === -1;

        if(isNotFavorited) {
            user.favorites.push(article);
            article.favoritesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }

    async deleteFromFavorites(userId: number, slug: string): Promise<ArticleEntity>
    {
        const article = await this.getBySlug(slug);
        const user = await this.userRepository.findOne(userId, {
            relations: ['favorites'],
        });

        const articleIndex = user.favorites
        .findIndex(articleInFavorites => articleInFavorites.id === article.id);

        if(articleIndex >= 0) {
            user.favorites.splice(articleIndex, 1);
            article.favoritesCount--;

            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    private getSlug(title: string) {
        return slugify(title, {
            lower: true
        }) + '-' + ((Math.random() * Math.pow(36, 6)) | 0 ).toString(36);
    }
    
}