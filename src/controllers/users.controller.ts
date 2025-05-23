import { Request, Response } from "express";
import { UsersService } from "../services/users.service";

export class UsersController {
  constructor(private usersService: UsersService) {}

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.usersService.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving users" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = await this.usersService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      res.status(400).json({ message: errorMessage });
    }
  }
}