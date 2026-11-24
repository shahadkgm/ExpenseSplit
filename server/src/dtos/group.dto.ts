import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class GroupMemberDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class CreateGroupDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  @IsIn(['INR', 'USD', 'EUR'])
  currency: 'INR' | 'USD' | 'EUR' = 'INR';

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GroupMemberDTO)
  members: GroupMemberDTO[] = [];
}
