import { Html, Body, Head, Text, Font } from "@react-email/components";
import EmailFooter from "./EmailFooter";
import { outfit } from "@/app/ui/fonts";

interface VerificationEmailProps {
    name: string;
    verificationCode: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = function ({
    name,
    verificationCode,
}) {
    return (
        <>
            <Html
                style={{
                    backgroundColor: "#111",
                    color: "#eee",
                    marginLeft: ".5rem",
                    marginTop: ".5rem",
                    display: "flex",
                    flexWrap: "nowrap",
                    flexDirection: "column",
                }}
            >
                <Head>
                    <title>Students Group | Verification Code</title>
                    <Font
                        fallbackFontFamily={"sans-serif"}
                        fontFamily={"outfit"}
                        webFont={{
                            url: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
                            format: "woff2",
                        }}
                    />
                </Head>
                <Body>
                    <h2
                        style={{
                            marginBottom: "2.4rem",
                        }}
                    >
                        Students Group - VerificationEmail
                    </h2>

                    <Text style={{ fontSize: ".95rem", fontWeight: "500" }}>
                        Hello,{" "}
                        <span
                            style={{
                                fontWeight: "600",
                            }}
                        >
                            {name}
                        </span>{" "}
                        !. Thanks for signing up on Students Group.
                    </Text>

                    <Text>
                        To complete the signup process, please enter this
                        verification code in the signup page.
                    </Text>

                    <Text>Verification code: {verificationCode}</Text>
                    <br />

                    <hr />
                    <br />
                    <EmailFooter />
                </Body>
            </Html>
        </>
    );
};

export default VerificationEmail;
