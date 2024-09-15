import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UsersService } from "./service/users.service";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/guard/auth.guard";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async findOne(@Param("id") id: string) {
    return await this.usersService.findOne(+id);
  }
}
