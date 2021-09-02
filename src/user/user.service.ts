import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from "@app/config";
import { UserResponseIntreface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/loginUser.dto";
import { hash, compare } from 'bcrypt';
import { UpdateUserDto } from "./dto/updateUser.dto";


@Injectable()
export class UserService{

    constructor
    (
        @InjectRepository(UserEntity) 
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {

        const errorResponse = {
            errors: {}
        };

        const userByEmail = await this.userRepository.findOne({
            email: createUserDto.email
        });

        const userByName = await this.userRepository.findOne({
            username: createUserDto.username
        });

        if(userByEmail)
            errorResponse.errors['email'] = "has already been taken";

        if(userByName)
            errorResponse.errors['username'] = "has already been taken";

        if(userByEmail || userByName)
            throw new 
                HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        console.log('newUser', newUser);
        
        return await this.userRepository.save(newUser);
    }

    async update (id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> { 
       await this.userRepository.update(id, updateUserDto);
       return await this.userRepository.findOne(id);
    }

    async login (LoginUserDto: LoginUserDto): Promise<UserEntity> {

        const errorResponse = {
            errors: {
                'email or password': 'is invalid'
            }
        };

        const user = await this.userRepository.findOne({
            email: LoginUserDto.email
        }, {select: [
            'id',
            'username',
            'email',
            'password',
            'img',
            'bio',
            'password'
        ]});

       if( ! user )  
            throw new 
                HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

       const password = await compare(LoginUserDto.password, user.password);

        if( ! password )
            throw new 
                HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);

        delete user.password;
        return user;
    }

    async findById(id: number): Promise<UserEntity>
    {
        return this.userRepository.findOne(id);
    }



    generateJwt(user: UserEntity): string {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, JWT_SECRET);
    }

    buildUserResponse(user: UserEntity): UserResponseIntreface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }
}