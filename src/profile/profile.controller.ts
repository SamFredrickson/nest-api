import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
   
  @Get(':username')
  async findByUsername(@User('id') userId: number, @Param('username') username: string): Promise<ProfileResponseInterface>
  {
    const profile = await this.profileService.findByUsername(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/profile/follow')
  @UseGuards(AuthGuard)
  async follow(@User('id') userId: number, @Param('username') username: string): Promise<ProfileResponseInterface>
  {
    const profile = await this.profileService.follow(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/profile/follow')
  @UseGuards(AuthGuard)
  async unfollow(@User('id') userId: number, @Param('username') username: string): Promise<ProfileResponseInterface>
  {
    const profile = await this.profileService.unfollow(userId, username);
    return this.profileService.buildProfileResponse(profile);
  }
} 