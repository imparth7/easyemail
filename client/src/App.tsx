import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";

// Define the shape of the form data
interface FormData {
    email: string;
    subject: string;
    mail: string;
    to_emails: string[];
    isHTMLMail: boolean;
}

function App() {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        subject: "",
        mail: "",
        to_emails: [""],
        isHTMLMail: false,
    });

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
            });
            console.log("Form submitted:", res.data);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <>
            <div className="w-full min-h-screen py-20 flex items-center justify-center bg-gray-300">
                <div className="max-w-lg w-full p-6 rounded-lg shadow-lg shadow-gray-400 bg-slate-400">
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-2 gap-6"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm transition ease-in-out duration-150"
                                placeholder="Your Email"
                                required
                            />
                        </div>
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
        </>
    );
}

export default App;
