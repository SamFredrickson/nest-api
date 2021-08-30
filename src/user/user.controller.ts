import { Body, Controller, Get, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { UserResponseIntreface } from "./types/userResponse.interface";
import { UserService } from "./user.service";
import { Request } from "express";
import { ExpressRequestInterface } from "@app/types/expressRequest.interface";
import { User } from "./decorators/user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./dto/updateUser.dto";

@Controller()
export class UserController {

    constructor(
        private readonly userService: UserService
    ) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async create(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseIntreface> {
        const user = await this.userService.create(createUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(@Body('user') LoginUserDto: LoginUserDto): Promise<UserResponseIntreface> {
        const user = await this.userService.login(LoginUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getCurrentUser(@User('id') user: UserEntity): Promise<UserResponseIntreface>
    {
        console.log(user);
        return this.userService.buildUserResponse(user);
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async update(@Body('user') updateUserDto: UpdateUserDto, @User('id') user: number): Promise<UserResponseIntreface>
    {
        const data = await this.userService.update(user, updateUserDto);
        return this.userService.buildUserResponse(data);
    }
}