"use client";
import React, { useState, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/util";
import { CiUser } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";
import { FaReact } from "react-icons/fa";
import { FiUserCheck } from "react-icons/fi";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";


const steps = ["Basic Info", "Technical BG", "Preview"];

const Joiningform = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    github: "",
    linkedin: "",
    languages: "",
    frameworks: "",
    interests: [] as string[],
    whyJoin: "",
    expectations: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });

    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      const { checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter((interest) => interest !== value),
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateStep = () => {
    const stepErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 0:
        if (!formData.name) stepErrors.name = "Name is required.";
        if (!formData.email) {
          stepErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          stepErrors.email = "Invalid email format.";
        }
        if (!formData.password) stepErrors.password = "Password is required.";
        if (!formData.github) {
          stepErrors.github = "GitHub link is required.";
        } else if (
          !/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+$/.test(
            formData.github
          )
        ) {
          stepErrors.github = "Invalid GitHub URL.";
        }
        if (!formData.linkedin) {
          stepErrors.linkedin = "LinkedIn link is required.";
        } else if (
          !/^https:\/\/www\.linkedin\.com\/.+$/.test(formData.linkedin)
        ) {
          stepErrors.linkedin = "Invalid LinkedIn URL.";
        }
        break;

      case 1:
        if (!formData.languages)
          stepErrors.languages = "Languages are required.";
        if (!formData.frameworks)
          stepErrors.frameworks = "Frameworks are required.";
        break;

      // We remove the intention validations (case 2) completely.
      // The 3rd step is now "Preview," so there's no validation needed here.

      default:
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Passing empty strings for `whyJoin` and `expectations`.
    const fetchdata = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email.toLowerCase(),
        password: formData.password,
        github: formData.github,
        linkedin: formData.linkedin,
        languages: formData.languages,
        frameworks: formData.frameworks,
        interests: formData.interests,
        // just send empty placeholders:
        why: "",
        expectations: "",
      }),
    });
    const response = await fetchdata.json();
    setLoading(false);
    if (response.success) {
      toast.success(
        "Your application has been submitted successfully & Account has been created successfully"
      );
      setTimeout(() => {
        toast.success("You will be redirected to the login page in 2 seconds");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }, 1000);
    } else {
      toast.error(response.message);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      // Step 0: Basic Info
      case 0:
        return (
          <div>
            <LabelInputContainer>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="DevSomeware"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="devsomeware@example.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="github">GitHub Link</Label>
              <Input
                id="github"
                name="github"
                type="url"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={handleChange}
              />
              {errors.github && (
                <p className="text-red-500 text-sm">{errors.github}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="linkedin">LinkedIn Link</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedin}
                onChange={handleChange}
              />
              {errors.linkedin && (
                <p className="text-red-500 text-sm">{errors.linkedin}</p>
              )}
            </LabelInputContainer>
          </div>
        );

      // Step 1: Technical BG
      case 1:
        return (
          <div>
            <LabelInputContainer>
              <Label htmlFor="languages">Known Programming Languages</Label>
              <Input
                id="languages"
                name="languages"
                placeholder="e.g., JavaScript, Python"
                type="text"
                value={formData.languages}
                onChange={handleChange}
              />
              {errors.languages && (
                <p className="text-red-500 text-sm">{errors.languages}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="frameworks">Known Frameworks</Label>
              <Input
                id="frameworks"
                name="frameworks"
                placeholder="e.g., React, Django"
                type="text"
                value={formData.frameworks}
                onChange={handleChange}
              />
              {errors.frameworks && (
                <p className="text-red-500 text-sm">{errors.frameworks}</p>
              )}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>Domains of Interest</Label>
              <div className="flex flex-wrap gap-4">
                {[
                  "AR/VR",
                  "AI/ML",
                  "Blockchain",
                  "Fullstack",
                  "Cloud/DevOps",
                  "Cybersecurity",
                ].map((interest) => (
                  <label key={interest} className="flex items-center space-x-0">
                    <input
                      type="checkbox"
                      name="interests"
                      value={interest}
                      checked={formData.interests.includes(interest)}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </LabelInputContainer>
          </div>
        );

      // Step 2: Preview (previously step 3)
      case 2:
        return (
          <div className="">
            <h3 className="text-2xl font-bold text-center mb-6">Preview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Box */}
              <div className="p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
                <h4 className="text-lg font-semibold mb-3 text-purple-600">
                  Personal Information
                </h4>
                <p className="mb-2 break-words flex justify-center items-center flex-col text-center">
  <FaGithub className="h-4 w-4" />
  <strong>GitHub: </strong>
  <div className="w-full max-w-[250px] sm:max-w-[350px] break-words">
    <a
      href={formData.github}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500"
    >
      {formData.github}
    </a>
  </div>
</p>

<p className="break-words flex justify-center items-center flex-col text-center">
  <FaLinkedin />
  <strong>LinkedIn: </strong>
  <div className="w-full max-w-[250px] sm:max-w-[350px] break-words">
    <a
      href={formData.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500"
    >
      {formData.linkedin}
    </a>
  </div>
</p>



              </div>

              {/* Technical Background Box */}
              <div className="p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
                <h4 className="text-lg font-semibold mb-3 text-blue-600">
                  Technical Background
                </h4>
                <p className="mb-2 break-words flex items-center">
                  <FaCode />
                  <strong className="mx-2">Languages:</strong>{" "}
                  {formData.languages}
                </p>
                <p className="mb-2 break-words flex items-center">
                  <FaReact />
                  <strong className="mx-2">Frameworks:</strong>{" "}
                  {formData.frameworks}
                </p>
                <p className="break-words flex items-center">
                  <FiUserCheck />
                  <strong className="mx-2">Interests:</strong>{" "}
                  {formData.interests.join(", ")}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black dark:bg-black">
      <main className="flex-grow">
        <div
          className="lg:max-w-screen-md sm:max-w-screen-sm mx-auto rounded-none md:rounded-2xl p-4 md:p-12 shadow-input bg-white dark:bg-black md:mb-72 mb-60"
          style={{ minHeight: "900px" }}
        >
          <h2 className="font-bold text-3xl text-center text-neutral-800 dark:text-neutral-200 mb-4">
            Join Devsomeware as Member
          </h2>
          <div className="flex flex-col ml-5 -mr-5 items-center overflow-hidden mb-5">
            {/* Progress Bar */}
            <div className="flex items-center justify-between w-full  sm:ml-[2rem] lg:ml-[8rem] max-w-4xl my-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center w-full">
                  <div
                    className={`relative flex items-center  justify-center w-12 h-12 rounded-full ${
                      index <= currentStep
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {index === currentStep && (
                      <div className="absolute w-16 h-16 bg-purple-500 opacity-30 rounded-full animate-pulse"></div>
                    )}
                    <span className="z-10 text-lg font-bold">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-grow h-1 mx-2 ${
                        index < currentStep ? "bg-purple-500" : "bg-gray-300"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between w-full lg:max-w-[35.5rem] sm:max-w-[34.5rem] mt-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={` mr-12 text-sm ${
                    index === currentStep
                      ? "text-purple-600 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="mb-6" style={{ minHeight: "200px" }}>
            {renderStepContent()}
          </div>
          <Toaster richColors />
          <div className="flex justify-between">
            {/* Previous Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-28 text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            >
              &larr; Previous
              <BottomGradient />
            </button>

            {/* Next or Submit Button */}
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-br py-2 text-center relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800  text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              >
                {loading ? (
                  <div className="flex justify-center items-center mx-1">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin mx-1" />
                    Submitting...
                  </div>
                ) : (
                  <div className="flex justify-center items-center mx-6">
                    Submit
                  </div>
                )}
                <BottomGradient />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-24 text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              >
                Next &rarr;
                <BottomGradient />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const LabelInputContainer = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col mb-5 space-y-2 w-full", className)}>
    {children}
  </div>
);

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

export default Joiningform;
