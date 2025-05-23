export class UsersService {
    findAll() {
        throw new Error("Method not implemented.");
    }
    create(body: any) {
        throw new Error("Method not implemented.");
    }
    private users: any[] = []; // This will hold user data temporarily

    constructor() {}

    createUser(user: any) {
        this.users.push(user);
        return user;
    }

    getUserById(id: string) {
        return this.users.find(user => user.id === id);
    }

    updateUser(id: string, updatedUser: any) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updatedUser };
            return this.users[index];
        }
        return null;
    }

    deleteUser(id: string) {
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
            const deletedUser = this.users.splice(index, 1);
            return deletedUser[0];
        }
        return null;
    }

    getAllUsers() {
        return this.users;
    }
}