import { Controller, Post, Body, Patch, Param, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dto/login.dto";
import { CreatePatientDto } from "../patients/dto/create-patient.dto";
import { CreateEmployeeDto } from "../employees/dto/create-employee.dto";
import { Auth } from "./decorator/auth.decorator";
import { Roles } from "./decorator/roles.decorator";
import { AllRole } from "@src/constants";
import { ActiveUser } from "@src/common/decorator/active-user-decorator";
import { UserActiveInterface } from "@src/common/interface/user-active-interface";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SendResetPasswordEmailDto } from "./dto/send-reset-password-email-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Auth(AllRole.ASSISTANT)
  @Post("register/patient")
  async registerPatient(@Body() createPatientDto: CreatePatientDto, @ActiveUser() user: UserActiveInterface) {
    return this.authService.registerPatient(createPatientDto, user);
  }

  //@Auth(AllRole.ADMIN)
  @Post("register/employee")
  async registerEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.authService.registerEmployee(createEmployeeDto);
  }

  @Patch("change-password")
  async changePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return this.authService.changePassword(updatePasswordDto.userEmail, updatePasswordDto);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Send reset password email" })
  @ApiBody({ type: SendResetPasswordEmailDto })
  async sendResetPasswordEmail(@Body() sendResetPasswordEmailDto: SendResetPasswordEmailDto) {
    return this.authService.sendResetPasswordEmail(sendResetPasswordEmailDto.email);
  }

  @Post("reset-password/:token")
  @ApiOperation({ summary: "Reset password" })
  @ApiParam({ name: "token", required: true, description: "Password reset token" })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Param("token") token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }
    return this.authService.resetPassword(token, resetPasswordDto.newPassword);
  }
}
