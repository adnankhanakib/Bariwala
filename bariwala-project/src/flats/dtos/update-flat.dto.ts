import { PartialType } from "@nestjs/mapped-types";
import { CreateFlatDTO } from "./create-flat.dto.js";

export class UpdateFlatDTO extends PartialType(CreateFlatDTO){}