import { Nunito, Outfit, Poppins } from "next/font/google";

export const poppins = Poppins({
    weight: ["300", "400", "600"],
    subsets: ["latin"],
});

export const outfit = Outfit({
    weight: ["300", "400", "600"],
    subsets: ["latin"],
});

export const nunito = Nunito({
    weight: ["300", "400", "500", "600"],
    subsets: ["latin"],
});
