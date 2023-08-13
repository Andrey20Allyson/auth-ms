import { PrismaClient } from "@prisma/client";
import { Injectable } from "../container";

@Injectable()
export class Database extends PrismaClient { }