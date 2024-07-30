import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PageProps {}

const Page: React.FC<PageProps> = function () {
    const handleGroupCreation: React.FormEventHandler = async (e) => {
        try {
            e.preventDefault();
        } catch (error) {}
    };

    return (
        <>
            <main className="h-screen w-screen flex flex-nowrap flex-col items-center justify-center">
                <h2 className="text-4xl font-semibold pb-12">
                    Create a new Group
                </h2>

                <form
                    onSubmit={handleGroupCreation}
                    className="flex flex-nowrap flex-col lg:w-[450px] gap-4"
                >
                    <div className="w-full">
                        <label className="pl-px text-[1.075rem] mb-1 block">
                            Name
                        </label>
                        <Input />
                    </div>

                    <div className="w-full">
                        <label className="pl-px text-[1.075rem] mb-1 block">
                            Description
                        </label>
                        <textarea className="text-[1.075rem] w-full resize-none min-h-[100px] rounded-md border border-input bg-background px-3 py-2 pt-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                    </div>

                    <Button
                        className="px-5 text-[1.05rem] mt-1.5 font-medium w-fit py-3"
                        variant={"secondary"}
                    >
                        Create
                    </Button>
                </form>
            </main>
        </>
    );
};

export default Page;
