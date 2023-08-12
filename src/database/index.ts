import { PrismaClient } from "@prisma/client";
import { Injectable } from "../utils/injection";

@Injectable
export class Database extends PrismaClient { }