import { poppins } from "@/app/ui/fonts";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Profile from "./profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import axios from "@/lib/config/axios.config";
import Account_details from "./account_details";
import Settings from "./settings";

interface PageProps {
    params?: { [index: string]: string };
    searchParams: { [index: string]: string };
}

const Page: React.FC<PageProps> = async function (request) {
    const currentTab = request.searchParams?.["tab"];
    const currentSession = await getServerSession(authOptions);

    const response = await axios.get(
        `${process.env.BASE_URL}/api/v1/users/${currentSession?.user._id}`,
        {
            headers: {
                Authorization:
                    "Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..MEgn6nVAjtpaSncx.vUGSMtnmgggu4fvEJMSL9PfiGdgaOJ2i9eCF_Fh3y6ZqR5GgeHfdTCHM2MBEJF5ptg0nDm-dMgkUseUskeqdAk7_bbMsk39EoifPh3bI7hAgIBAHjSJRaHVkB2XKdW_fLdvwDfRPPZNu0RXnacuNdz4j_gz5Maau9RMndSTC05SJL7rvSrICQLiYw7f_1zemS2l4NGtPBjSrULeq-s8Ccy-99N1vFe0CyN21ZQPGuxBd.Cn4J9q-Svr8jutS3Cj6h5g",
            },
        }
    );

    return (
        <>
            <main
                className={`grid lg:grid-cols-[1.2fr_1.45px_4fr] min-h-screen w-screen ${poppins.className}`}
            >
                <aside className="flex bg-gray-900 flex-col flex-nowrap items-center">
                    <ul className="flex flex-nowrap flex-col text-center mt-12 w-full lg:text-[1.05rem] text-[1rem] lg:gap-[0.85rem] gap-[0.75rem]">
                        <li className="w-[83%] rounded-md cursor-pointer mx-auto hover:bg-slate-800 px-3 py-2.5">
                            <Link href={"/user"}>Profile</Link>
                        </li>
                        <li className="w-[83%] py-2.5 rounded-md mx-auto hover:bg-slate-800 h-[calc(100%+800px)]">
                            <Link
                                className="w-full h-full block"
                                href={"/user?tab=account-details"}
                            >
                                Account Details
                            </Link>
                        </li>
                        <li className="w-[83%] rounded-md cursor-pointer mx-auto hover:bg-slate-800 px-3 py-2.5">
                            <Link
                                className="w-full h-full block"
                                href={"/user?tab=settings"}
                            >
                                Settings
                            </Link>
                        </li>
                    </ul>
                </aside>

                <Separator
                    className="bg-red-500 h-full w-[1.45px]"
                    orientation="vertical"
                />

                <section className="flex flex-col text-lg pt-10 pl-20">
                    {currentTab === undefined && (
                        <>
                            <Profile user={response.data?.data} />
                        </>
                    )}
                    {currentTab === "settings" && (
                        <>
                            <Settings />
                        </>
                    )}
                    {currentTab === "account-details" && (
                        <>
                            <Account_details user={response.data?.data} />
                        </>
                    )}
                </section>
            </main>
        </>
    );
};

export default Page;
