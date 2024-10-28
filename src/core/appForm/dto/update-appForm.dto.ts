import { PartialType } from "@nestjs/mapped-types";
import { CreateAppFormularyDto } from "./create-appForm.dto";

export class UpdateAppFormularyDto extends PartialType(CreateAppFormularyDto) {}
