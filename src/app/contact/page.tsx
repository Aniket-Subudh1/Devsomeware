"use client";

import starsBg from "@/assets/stars.png";
import { useRef, useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import img1 from "@/assets/terminal.png";
import img2 from "@/assets/arrow-up.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { LogoMotion } from "@/sections/LogoMotion";

const Contact = () => {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  type AlertType = "danger" | "success";

  const [alert, setAlert] = useState<{
    show: boolean;
    text: string;
    type: AlertType;
  }>({
    show: false,
    text: "",
    type: "danger",
  });
  const [loading, setLoading] = useState<boolean>(false);

  interface FormState {
    name: string;
    email: string;
    message: string;
  }

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });

  // Alert functions
  const showAlert = ({
    text,
    type = "danger",
  }: {
    text: string;
    type?: AlertType;
  }) => setAlert({ show: true, text, type });
  const hideAlert = () => setAlert({ show: false, text: "", type: "danger" });

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name as keyof FormState;
    const value = e.target.value;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const response = await data.json();
    setLoading(false);
    if (response.success) {
      showAlert({ text: "Message sent successfully!", type: "success" });
      setTimeout(() => {
        hideAlert();
        setForm({ name: "", email: "", message: "" });
      }, 3000);
    } else {
      showAlert({ text: response.message, type: "danger" });
    }
  };

  // Alert component
  const Alert = ({ type, text }: { type: AlertType; text: string }) => {
    return (
      <div className="fixed bottom-5 right-5 flex justify-center items-center z-50">
        <div
          className={`p-5 ${
            type === "danger" ? "bg-red-800" : "bg-blue-800"
          } items-center text-indigo-100 leading-none rounded-md flex`}
          role="alert"
        >
          <span
            className={`flex rounded-full ${
              type === "danger" ? "bg-red-500" : "bg-blue-500"
            } uppercase px-2 py-1 text-xs font-semibold mr-3`}
          >
            {type === "danger" ? "Failed" : "Success"}
          </span>
          <span className="mr-2 text-left">{text}</span>
        </div>
      </div>
    );
  };

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundPositionY = useTransform(
    scrollYProgress,
    [0, 1],
    [-300, 300]
  );

  const isActive = pathname === "/contact";
  return (
    <>
      {alert.show && <Alert type={alert.type} text={alert.text} />}

      <motion.section
        ref={sectionRef}
        style={{
          backgroundImage: `url(${starsBg.src})`,
          backgroundPositionY: backgroundPositionY.get(), // Correcting motion value
        }}
        animate={{
          backgroundPositionX: ["0px", `${starsBg.width}px`], // Infinite X animation
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className={`my-20 min-h-screen relative flex items-center justify-center bg-black text-white ${
          isActive ? " shadow-lg" : ""
        }`}
        id="contact"
      >
        <Image
          src={img1}
          alt="terminal-bg"
          height={800}
          width={1000}
          className="absolute inset-0 lg:object-cover sm:object-fill lg:w-[70rem] md:w-[7
          0rem] sm:w-[30rem] sm:h-[45rem] lg:h-auto mx-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        {/* Contact Form */}
        <div className="relative z-10 max-w-2xl w-full px-4 text-center">
          <h3 className="text-4xl font-extrabold">Let&apos;s Talk</h3>
          <p className="mt-3 text-lg text-gray-300">
            Whether you are interested in contributing to open-source projects,
            joining our community, or just saying hello, we’d love to hear from
            you!
          </p>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-12 space-y-6"
          >
            <label className="block text-left">
              <span className="text-white">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., DevSomeware"
              />
            </label>

            <label className="block text-left">
              <span className="text-white">Email Address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., devsomeware@gmail.com"
              />
            </label>

            <label className="block text-left">
              <span className="text-white">Your Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="mt-1 block w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Share your thoughts or inquiries..."
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
              <Image
                src={img2}
                alt="arrow-up"
                width={20}
                height={20}
                className="ml-2"
              />
            </button>
          </form>
        </div>
      </motion.section>
      <LogoMotion />
    </>
  );
};

export default Contact;
