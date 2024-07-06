interface User {
    name: String;
    username: String;
    email: String;
    password: String;
    isVerified: Boolean;
    dateOfBirth: Date;
    bio: String;
    gender?: "Male" | "Female";
    avatar?: String;
    joinedGroups: any; // check
    createdAt: Date;
    updatedAt: Date;
}
