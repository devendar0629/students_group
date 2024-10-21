"use client";

import Image from "next/image";
import maleAvatarPlaceholder from "@/../public/male-avatar-placeholder.jpg";

interface UserAvatarProps {
    avatarUrl?: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = function ({
    avatarUrl,
    height,
    width,
    alt,
    className,
}) {
    return (
        <>
            <Image
                className={`rounded-md ${className}`}
                width={width || 40}
                height={height || 40}
                alt={alt || "avatar image"}
                src={avatarUrl || maleAvatarPlaceholder.src}
            />
        </>
    );
};

export default UserAvatar;
