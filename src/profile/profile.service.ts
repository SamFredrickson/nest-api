import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "@app/user/user.entity";
import { ProfileResponseInterface } from "./types/profileResponse.interface";
import { ProfileType } from "./types/profile.type";
import { FollowEntity } from "./follow.entity";

@Injectable()
export class ProfileService {
   
    constructor
    (
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
    ) {}

    async findByUsername(userId: number, username: string): Promise<ProfileType>
    {
        const user = await this.userRepository.findOne({
            username: username
        });

        if( ! user )
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);

        const follow = await this.followRepository.findOne({
            followerId: userId,
            followingId: user.id
        });

        return { ...user, following: Boolean(follow) ? true : false };
    }

    async follow(userId: number, username: string): Promise<ProfileType>
    {
        const user = await this.userRepository.findOne({
            username: username
        });

        if( ! user )
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);

        if(userId === user.id)
            throw new HttpException('You are not able to follow yourself', HttpStatus.BAD_REQUEST);

        const follow = await this.followRepository.findOne({
            followerId: userId,
            followingId: user.id
        });

        if( ! follow ) {
            const followToCreate = new FollowEntity();
            followToCreate.followerId = userId;
            followToCreate.followingId = user.id;

            this.followRepository.save(followToCreate);
        }

        return { ...user, following: true };
    }

    async unfollow(userId: number, username: string): Promise<ProfileType>
    {
        const user = await this.userRepository.findOne({
            username: username
        });

        if( ! user )
            throw new HttpException('Profile does not exist', HttpStatus.NOT_FOUND);

        if(userId === user.id)
            throw new HttpException('You are not able to unfollow yourself', HttpStatus.BAD_REQUEST);

        await this.followRepository.delete({
            followerId: userId,
            followingId: user.id
        });

        return { ...user, following: false };
    }

    buildProfileResponse(profile: ProfileType): ProfileResponseInterface
    {
        delete profile.email;
        return { profile };
    }
   
}