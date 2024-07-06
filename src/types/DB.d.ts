declare module "DB" {
    interface User {
        name: string;
        username: string;
        email: string;
        password: string;
        isVerified: boolean;
        dateOfBirth: Date;
        bio: string;
        gender?: "Male" | "Female";
        avatar?: string;
        joinedGroups: any; // update
        createdAt: Date;
        updatedAt: Date;
    }
}
