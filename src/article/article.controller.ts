import { BackendValidationPipe } from "@app/shared/pipes/backendValidation.pipe";
import { User } from "@app/user/decorators/user.decorator";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { UserEntity } from "@app/user/user.entity";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Controller('articles')
export class ArticleController {

    constructor(
        private readonly articleService: ArticleService
    ) {}

    @Get()
    async all(@User('id') userId: number, @Query() query: any): Promise<ArticlesResponseInterface>
    {   
        return await this.articleService.all(userId, query);
    }   

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(@User('id') userId: number, @Query() query: any): Promise<ArticlesResponseInterface>
    {
        return await this.articleService.getFeed(userId, query);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addToFavorites(@User('id') userId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface>
    {
        const article = await this.articleService.addToFavorites(userId, slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async DeleteFromFavorites(@User('id') userId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface>
    {
        const article = await this.articleService.deleteFromFavorites(userId, slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async create(@User() user: UserEntity, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
        const article =  await this.articleService.create(user, createArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Get(':slug')
    async GetBySlug(@Param('slug') slug: string): Promise<ArticleResponseInterface>
    {
        const article =  await this.articleService.getBySlug(slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async delete(@User('id') userId: number, @Param('slug') slug: string): Promise<any>
    {
        return await this.articleService.delete(slug, userId);
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async update(@User('id') userId: number, @Param('slug') slug: string, @Body('article') updateArticleDto: CreateArticleDto): Promise<ArticleResponseInterface>
    {
        const article = await this.articleService.update(userId, slug, updateArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

}