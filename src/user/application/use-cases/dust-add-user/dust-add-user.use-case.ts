import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import { EntityValidationError } from '../../../../shared/domain/validators/validation.error';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { User } from '../../../domain/user.entity';
import { IUserRepository } from '../../../domain/user.repository';
import { UserOutputMapper, type UserOutput } from '../_user-shared/user-output';
import { ValidateAddDustUserInput, type AddDustUserInput } from './dust-add-user.input';

export class AddDustUserUseCase implements IUseCase<AddDustUserInput, AddDustUserOutput> {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: AddDustUserInput): Promise<AddDustUserOutput> {
    const errors = ValidateAddDustUserInput.validate(input);
    if (errors.length > 0) {
      throw errors;
    }

    const uuid = new Uuid(input.id);
    const user = await this.userRepo.findById(uuid);

    if (!user) {
      throw new NotFoundError(input.id, User);
    }

    user.addDust(input.dust);

    if (user.notification.hasErrors()) {
      throw new EntityValidationError(user.notification.toJSON());
    }

    await this.userRepo.update(user);

    return UserOutputMapper.toOutput(user);
  }
}

export type AddDustUserOutput = UserOutput;
