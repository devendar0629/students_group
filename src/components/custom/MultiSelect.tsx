import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ArrowDownIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface Option {
    label: string;
    value: string;

    checked?: boolean;
}
export interface MultiSelectProps {
    options: Option[];
    onChange: (selectedItems: string[]) => void;
    selectLabel: string;
    selectClassName?: string;
    selectItemClassName?: string;
    triggerClassName?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    onChange,
    selectClassName,
    triggerClassName,
    selectItemClassName,
    selectLabel,
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const [_Options, set_Options] = useState<Option[]>([]);

    useEffect(() => {
        set_Options(
            options.map((option) => {
                option.checked = false;
                return option;
            })
        );
    }, [options]);

    const handleCheckboxChange = (checked: CheckedState, id: number) => {
        if (_Options[id].checked) {
            setSelectedItems(
                selectedItems.filter((el) => el !== _Options[id].value)
            );
        } else {
            setSelectedItems((prevSelected) => [
                ...prevSelected,
                _Options[id].value,
            ]);
        }

        _Options[id].checked = !_Options[id].checked;
    };

    useEffect(() => {
        onChange(selectedItems);
    }, [selectedItems, onChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <Button
                type="button"
                variant={"secondary"}
                ref={buttonRef}
                className={`p-2 px-3 rounded-md cursor-pointer flex flex-row flex-nowrap gap-2 items-center ${triggerClassName}`}
                onClick={toggleDropdown}
            >
                {selectLabel}
                <ArrowDownIcon
                    className={`h-[1.1rem] transition pb-px duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </Button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute max-w-sm rounded-md top-[100%] l-0 mt-0.5 py-px flex flex-col flex-nowrap max-h-[200px] overflow-y-auto z-[1] ${selectClassName}`}
                >
                    {_Options.map((option, index) => (
                        <>
                            <div
                                key={option.value}
                                className={`font-medium flex flex-row pl-[.65rem] pr-2.5 gap-[1.15rem] items-center py-1.5 my-1 ${selectItemClassName}`}
                            >
                                <Checkbox
                                    id={`cbox-${index}`}
                                    checked={option.checked}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange(checked, index)
                                    }
                                    className="bg-slate-500 h-5 w-5"
                                />

                                <label
                                    htmlFor={`cbox-${index}`}
                                    className="cursor-pointer pt-px text-ellipsis whitespace-nowrap max-w-fit overflow-hidden"
                                >
                                    {option.label}
                                </label>
                            </div>

                            {index + 1 < options.length && (
                                <hr
                                    key={`${option.value}--${index}`}
                                    role="separator"
                                />
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
