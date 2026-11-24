import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsIn } from 'class-validator';

export class CreateExpenseDTO {
  @IsString()
  @IsNotEmpty()
  groupId?: string;

  @IsString()
  @IsOptional()
  tripId?: string; // Support both groupId and legacy tripId

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paidBy!: string;

  @IsOptional()
  splitAmong?: 'All' | string[];
}
