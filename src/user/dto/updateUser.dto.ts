import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
    
    @IsEmail()
    readonly email: string;

    readonly username: string;

    readonly password: string;

    readonly img: string;

    readonly bio: string;
}