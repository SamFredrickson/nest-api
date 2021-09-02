import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata)
    {
        const object = plainToClass(metadata.metatype, value);
        const errors = await validate(object);
        console.log('transform', object, errors);

        if(errors.length === 0)
            return value;

        throw new HttpException({
            errors: this.formatErrors(errors)
        }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    formatErrors(errors: ValidationError[]) 
    {
        return errors.reduce((acc, error) => {
           acc[error.property] = Object.values(error.constraints);
           return acc;
        }, {});
    }
}