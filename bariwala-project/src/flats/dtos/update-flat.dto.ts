import { PartialType } from "@nestjs/swagger";
import { CreateFlatDTO } from "./create-flat.dto.js";

export class UpdateFlatDTO extends PartialType(CreateFlatDTO){}