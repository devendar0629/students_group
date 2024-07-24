import { Switch } from "@/components/ui/switch";

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = function () {
    return (
        <>
            <section className="h-full w-full">
                <div className="text-2xl font-semibold">Preferences</div>
                <div className="flex flex-col flex-nowrap gap-2.5">
                    <div className="flex flex-row flex-nowrap items-center gap-3 mt-10">
                        <Switch />
                        <p className="text-[.935rem]">Dark Mode</p>
                    </div>
                    <div className="flex flex-row flex-nowrap items-center gap-3">
                        <Switch />
                        <p className="text-[.935rem]">Receive product emails</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Settings;
