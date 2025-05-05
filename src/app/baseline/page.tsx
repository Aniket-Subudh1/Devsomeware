"use client";
import React, { useState, ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BaselineTestForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [campus, setCampus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    registrationNo: "",
    domainName: "",
    email: "",
    phoneNumber: "",
    branch: "",
    campus: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Domain options based on campus
  const domains = {
    bbsr: [
      "Data Analytics and Machine Learning + Generative AI",
      "Cloud Technology + Full-Stack Development with MERN",
      "Data Analytics and Machine Learning",
      "Software Technology",
      "Cybersecurity Domain Track",
      "Gaming and Immersive Learning: AR/VR Domain Track",
      "Blockchain Domain Track",
      "Cloud Technology Domain Track",
    ],
    pkd: [
      "Data Analytics and Machine Learning + Generative AI",
      "Cloud Technology + Full-Stack Development with MERN",
      "Data Analytics and Machine Learning",
      "Software Technology",
      "Cybersecurity Domain Track",
      "Gaming and Immersive Learning: AR/VR Domain Track",
      "Blockchain Domain Track",
      "Cloud Technology Domain Track",
    ],
    vzm: [
      "Artificial Intelligence & Machine Learning (AIML)",
      "Data Analysis & Machine Learning (DAML)",
      "Software Engineering (SE)",
      "Computer Network (CN)",
      "IoT Cyber Security Blockchain (CIC)",
    ],
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Clear errors when user changes input
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });

    // If campus is being changed, reset domain name
    if (name === "campus") {
      setCampus(value);
      setFormData({
        ...formData,
        [name]: value,
        domainName: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Registration number validation
    if (!formData.registrationNo.trim()) {
      newErrors.registrationNo = "Registration number is required";
    }

    // Domain validation
    if (!formData.domainName) {
      newErrors.domainName = "Please select a domain";
    }

    // Email validation - must end with cutm.ac.in
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.endsWith("@cutm.ac.in")) {
      newErrors.email =
        "Email must be a valid CUTM email (ending with @cutm.ac.in)";
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // Branch validation
    if (!formData.branch.trim()) {
      newErrors.branch = "Branch is required";
    }

    // Campus validation
    if (!formData.campus) {
      newErrors.campus = "Please select a campus";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      // In a real implementation, you would make an API call here
      // const response = await fetch("/api/placement-registration", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();

      // Simulate successful submission
      setTimeout(() => {
        setLoading(false);
        toast.success("Form submitted successfully!");

        setFormData({
          name: "",
          registrationNo: "",
          domainName: "",
          email: "",
          phoneNumber: "",
          branch: "",
          campus: "",
        });

        setTimeout(() => {
          console.log("Form submitted:", formData);
        }, 2000);
      }, 1500);
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred. Please try again.");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black dark:bg-black">
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-4xl w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-12 shadow-input bg-white dark:bg-black">
          <h2 className="font-bold text-3xl text-center text-neutral-800 dark:text-neutral-200 mb-6">
            Baseline Test Form
          </h2>
          <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center mx-auto mb-8">
            Select your preferred domain for placement training
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LabelInputContainer>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                type="text"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="registrationNo">Registration Number</Label>
              <Input
                id="registrationNo"
                name="registrationNo"
                placeholder="Enter your registration number"
                type="text"
                value={formData.registrationNo}
                onChange={handleChange}
              />
              {errors.registrationNo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.registrationNo}
                </p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="registration@cutm.ac.in"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="10-digit phone number"
                type="tel"
                maxLength={10}
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                name="branch"
                placeholder="e.g., Computer Science, Electronics"
                type="text"
                value={formData.branch}
                onChange={handleChange}
              />
              {errors.branch && (
                <p className="text-red-500 text-sm mt-1">{errors.branch}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="campus">Campus</Label>
              <select
                id="campus"
                name="campus"
                value={formData.campus}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Select Campus</option>
                <option value="bbsr">Bhubaneswar (BBSR)</option>
                <option value="pkd">Paralakhemundi (PKD)</option>
                <option value="vzm">Vizianagaram (VZM)</option>
              </select>
              {errors.campus && (
                <p className="text-red-500 text-sm mt-1">{errors.campus}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer className="md:col-span-2">
              <Label htmlFor="domainName">Preferred Domain</Label>
              <select
                id="domainName"
                name="domainName"
                value={formData.domainName}
                onChange={handleChange}
                disabled={!formData.campus}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:text-white"
              >
                <option value="">
                  {formData.campus
                    ? "Select Domain"
                    : "Please select a campus first"}
                </option>
                {formData.campus &&
                  domains[formData.campus as keyof typeof domains].map(
                    (domain, index) => (
                      <option key={index} value={domain}>
                        {domain}
                      </option>
                    )
                  )}
              </select>
              {errors.domainName && (
                <p className="text-red-500 text-sm mt-1">{errors.domainName}</p>
              )}
            </LabelInputContainer>
          </div>

          <div className="mt-8">
            <Toaster richColors />
            <button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-12 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              onClick={handleSubmit}
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Application"
              )}
              <BottomGradient />
            </button>
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
  <div className={cn("flex flex-col space-y-2 w-full", className)}>
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

export default BaselineTestForm;
