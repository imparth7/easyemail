import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";
import { EncryptedData, encryptData } from './utils/crypto'; // Adjust the path accordingly

// Define the shape of the form data
interface FormData {
    email: string;
    password: EncryptedData;
    subject: string;
    mail: string;
    to_emails: string[];
    isHTMLMail: boolean;
}

interface Credentials {
    email: string;
    password: string;
}

function App() {
    const emptyFormData: FormData = {
        email: "",
        password: { iv: "", cipherText: "", tag: "" },
        subject: "",
        mail: "",
        to_emails: [""],
        isHTMLMail: false,
    }

    const [formData, setFormData] = useState<FormData>(emptyFormData);

    const [credentials, setCredentials] = useState<Credentials>({
        email: "",
        password: "",
    });

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const addReceiver = () => {
        setFormData((prevData) => ({
            ...prevData,
            to_emails: [...prevData.to_emails, ""],
        }));
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        let { name, value, type } = e.target;

        if (type === "checkbox") {
            const { checked } = e.target as HTMLInputElement;
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleCredentialChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setCredentials((prevCredentials) => ({
            ...prevCredentials,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formData);
        try {
            const res = await axios.post("http://localhost:8080/email", {
                from_email: formData.email,
                to_emails: formData.to_emails,
                subject: formData.subject,
                mail: formData.mail,
                isHTMLMail: formData.isHTMLMail,
                passkey: formData.password
            });
            console.log("Form submitted:", res.data);
            setFormData(emptyFormData)
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleEncrypt = async (encryptionText: string, key: string) => {
        try {
            const result = await encryptData(encryptionText, key);
            return result
        } catch (error) {
            console.error('Encryption failed:', error);
        }
    };

    const handleModalSubmit = async () => {
        if (credentials.email !== "" && credentials.password !== "") {
            const enc_password = await handleEncrypt(credentials.password, credentials.email);

            localStorage.setItem("cred_email", JSON.stringify(credentials.email))
            localStorage.setItem("cred_password", JSON.stringify(enc_password))

            const emptyPass = { iv: "", cipherText: "", tag: "" }

            setCredentials(prev => { return { ...prev, password: "" } })
            setFormData(prev => { return { ...prev, email: credentials.email, password: enc_password || emptyPass } })

            toggleModal();
        } else {
            alert("Fill Credentials Email and Password both fields.")
        }
    };

    return (
        <>
            <div className="w-full min-h-screen py-10 flex items-center justify-center bg-gray-300">
                <button
                    type="button"
                    className="fixed z-50 top-4 right-4 py-2 px-4 bg-[#00447C] text-white rounded-lg shadow-md hover:bg-blue-700 transition ease-in-out duration-150"
                    onClick={toggleModal}
                >
                    Open Credentials
                </button>
                <div className="max-w-lg w-full p-6 rounded-lg shadow-lg shadow-gray-400 bg-slate-400 relative">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-6"
                    >
                        <div>
                            <label
                                htmlFor="subject"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm transition ease-in-out duration-150"
                                placeholder="Email Subject"
                                required
                            />
                        </div>
                        {formData.to_emails.map((item, i) => (
                            <div key={i}>
                                <label
                                    htmlFor={`email${i}`}
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Receiver Email {i + 1}
                                </label>
                                <input
                                    type={`email${i}`}
                                    id={`email${i}`}
                                    name={`email${i}`}
                                    value={item}
                                    onChange={(e) => {
                                        let { value } = e.target;
                                        let to_emails = [...formData.to_emails];
                                        to_emails[i] = value;

                                        setFormData((prevData) => ({
                                            ...prevData,
                                            to_emails: to_emails,
                                        }));
                                    }}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm transition ease-in-out duration-150"
                                    placeholder={`Receiver Email`}
                                    required
                                />
                            </div>
                        ))}
                        <div className="col-span-2 grid grid-cols-2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isHTMLMail"
                                    name="isHTMLMail"
                                    checked={formData.isHTMLMail}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor="isHTMLMail"
                                    className="ml-2 text-sm text-gray-700"
                                >
                                    This is written in HTML Format?
                                </label>
                            </div>
                            <button
                                type="button"
                                className="w-full py-3 px-4 bg-slate-900 text-white font-semibold rounded-full shadow-md hover:bg-slate-600 transition ease-in-out duration-150"
                                onClick={addReceiver}
                            >
                                Add Receiver
                            </button>
                        </div>
                        <div className="col-span-2">
                            <label
                                htmlFor="mail"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Mail
                            </label>
                            <textarea
                                id="mail"
                                name="mail"
                                value={formData.mail}
                                onChange={handleChange}
                                rows={6}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm transition ease-in-out duration-150"
                                placeholder="Your Mail"
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="col-span-2 w-full py-3 px-4 bg-[#00447C] text-white font-semibold rounded-lg shadow-md hover:bg-[#4682B4] transition ease-in-out duration-150"
                        >
                            Send Mail
                        </button>
                    </form>
                </div>
            </div>

            {/* Modal for credentials */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Enter Credentials</h3>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleCredentialChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm"
                            placeholder="Email"
                            required
                        />
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700 mt-4"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleCredentialChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm"
                            placeholder="Password"
                            required
                        />
                        <span className="text-xs">Add App Passwords in your google account and generated password write in above password field.</span>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                type="button"
                                className="py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition ease-in-out duration-150"
                                onClick={toggleModal}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ease-in-out duration-150"
                                onClick={handleModalSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
