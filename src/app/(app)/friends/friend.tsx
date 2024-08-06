import Image from "next/image";
import RemoveFriendButton from "./remove-friend-button";

interface FriendProps {
    friendData: {
        _id: string;
        username: string;
        avatar: string;
    };
}

const Friend: React.FC<FriendProps> = function ({ friendData }) {
    return (
        <>
            <section className="px-3.5 bg-gray-700 py-2.5 rounded-sm flex flex-nowrap w-full flex-row gap-2 items-center">
                <Image
                    height={40}
                    width={40}
                    src={friendData.avatar}
                    alt={`${friendData.username} profile photo`}
                    className="bg-pink-400 rounded-[50%] h-[calc(45px-0.5rem)] w-[calc(45px-0.5rem)]"
                />

                <p className="text-[.95rem] font-semibold ml-8">
                    ~{friendData.username}
                </p>

                <RemoveFriendButton friendId={friendData._id} />
            </section>
        </>
    );
};

export default Friend;
