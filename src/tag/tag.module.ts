import {Module} from "@nestjs/common";
import { TagController } from '@app/tag/tag.controller';
import { TagService } from '@app/tag/tag.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { TagEntity } from "./tag.entity";


@Module({
    imports: [TypeOrmModule.forFeature([TagEntity])],
    controllers: [TagController],
    providers: [TagService]
})

export class TagModule {

}