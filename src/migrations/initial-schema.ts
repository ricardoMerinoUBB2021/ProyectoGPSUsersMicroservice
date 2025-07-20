import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class InitialSchema1623456789012 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create permissions table
        await queryRunner.createTable(new Table({
            name: "permissions",
            columns: [
                {
                    name: "permissionsid",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "permissionname",
                    type: "text",
                    isNullable: false
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                }
            ]
        }));

        // Create roles table
        await queryRunner.createTable(new Table({
            name: "roles",
            columns: [
                {
                    name: "roleid",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "rolename",
                    type: "text",
                    isNullable: true,
                    isUnique: true
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                }
            ]
        }));

        // Create users table
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                {
                    name: "userid",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "username",
                    type: "character varying",
                    isNullable: false,
                    isUnique: true
                },
                {
                    name: "credentials",
                    type: "character varying",
                    isNullable: false
                },
                {
                    name: "salt",
                    type: "character varying",
                    isNullable: false
                }
            ]
        }));

        // Create beneficiary table
        await queryRunner.createTable(new Table({
            name: "beneficiary",
            columns: [
                {
                    name: "beneficiaryid",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "discountcategory",
                    type: "character varying",
                    isNullable: false
                },
                {
                    name: "discount",
                    type: "real",
                    isNullable: true
                },
                {
                    name: "userid",
                    type: "integer",
                    isNullable: true
                }
            ]
        }));

        // Create persons table
        await queryRunner.createTable(new Table({
            name: "persons",
            columns: [
                {
                    name: "rut",
                    type: "character varying",
                    isPrimary: true
                },
                {
                    name: "name",
                    type: "character varying",
                    isNullable: false
                },
                {
                    name: "lastname",
                    type: "character varying",
                    isNullable: true
                },
                {
                    name: "beneficiaryid",
                    type: "integer",
                    isNullable: true
                }
            ]
        }));

        // Create roles_permissions junction table
        await queryRunner.createTable(new Table({
            name: "roles_permissions",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "rolesid",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "permissionsid",
                    type: "integer",
                    isNullable: false
                }
            ]
        }));

        // Create users_roles junction table
        await queryRunner.createTable(new Table({
            name: "users_roles",
            columns: [
                {
                    name: "id",
                    type: "integer",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "usersid",
                    type: "integer",
                    isNullable: false
                },
                {
                    name: "rolesid",
                    type: "integer",
                    isNullable: false
                }
            ]
        }));

        // Add foreign key constraints
        await queryRunner.createForeignKey("beneficiary", new TableForeignKey({
            columnNames: ["userid"],
            referencedColumnNames: ["userid"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("persons", new TableForeignKey({
            columnNames: ["beneficiaryid"],
            referencedColumnNames: ["beneficiaryid"],
            referencedTableName: "beneficiary",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("roles_permissions", new TableForeignKey({
            columnNames: ["rolesid"],
            referencedColumnNames: ["roleid"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("roles_permissions", new TableForeignKey({
            columnNames: ["permissionsid"],
            referencedColumnNames: ["permissionsid"],
            referencedTableName: "permissions",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("users_roles", new TableForeignKey({
            columnNames: ["usersid"],
            referencedColumnNames: ["userid"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("users_roles", new TableForeignKey({
            columnNames: ["rolesid"],
            referencedColumnNames: ["roleid"],
            referencedTableName: "roles",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.dropTable("users_roles");
        await queryRunner.dropTable("roles_permissions");
        await queryRunner.dropTable("persons");
        await queryRunner.dropTable("beneficiary");
        await queryRunner.dropTable("users");
        await queryRunner.dropTable("roles");
        await queryRunner.dropTable("permissions");
    }
}