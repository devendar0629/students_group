import axios from "@/lib/config/axios.config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Friend from "./friend";

interface PageProps {}

const Page: React.FC<PageProps> = async function () {
    const userToken = cookies().get("next-auth.session-token")?.value;

    if (!userToken) {
        return redirect(`${process.env.BASE_URL}/signin`);
    }

    let friends: any[] | null | undefined;

    try {
        const response = await axios.get(
            `${process.env.BASE_URL}/api/v1/friends`,
            {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            }
        );

        if (response.status === 200) friends = response.data.data.friends;
        else friends = null;
    } catch (error) {
        friends = null;
    }

    return (
        <main className="flex flex-nowrap flex-col pt-10 pl-12">
            <h2 className="text-4xl font-semibold">Friends</h2>

            <ul className="flex mt-8 pl-2.5 flex-nowrap flex-col gap-2 w-fit">
                {friends &&
                    friends.map((friend) => (
                        <Friend key={friend._id} friendData={friend} />
                    ))}

                {friends && friends.length === 0 && (
                    <p>You have no friends ...</p>
                )}
            </ul>
        </main>
    );
};

export default Page;
