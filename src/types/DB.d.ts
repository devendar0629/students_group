declare module DB {
    // Pure types without involving mongoose Document

    export interface User {
        name: string;
        username: string;
        email: string;
        password: string;
        isVerified: boolean;
        dateOfBirth: Date;
        bio: string;
        gender?: "Male" | "Female";
        avatar?: string;
        joinedGroups: any; // to be update
        createdAt: Date;
        updatedAt: Date;
    }

    export interface Group {
        messages: Message[];
        name: string;
        description: string;
        admin: User;
        members: User[];
        createdBy: User;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface Message {
        content: string;
        mediaFile: any; // to be updated
        sender: User;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface Token {
        user: User;
        verificationCode: string;
        verificationCodeExpiry: Date;
        createdAt: Date;
        updatedAt: Date;
    }

    export interface Media {
        sender: User;
        link: string;
        createdAt: Date;
        updatedAt: Date;
    }
}
