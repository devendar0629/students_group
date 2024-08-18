export const extractGroupNumberFromTag = (tag: HTMLDivElement): number => {
    const classNames = Array.from(tag.classList).join("");
    const index = classNames.lastIndexOf("gp-no-");

    return Number(classNames[index + 6]);
};
