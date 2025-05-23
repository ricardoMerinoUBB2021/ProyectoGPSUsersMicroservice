export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
};