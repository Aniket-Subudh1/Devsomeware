"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hook";
import { useRouter } from "next/navigation";
import { add } from "@/lib/features/user/userSlice";
import { ButtonGradient } from "@/components/ui/ButtonGradient";
import { LabelInputContainer } from "@/components/ui/LabelInputContainer";
import { FaUpload } from "react-icons/fa";
import Cropper from "react-easy-crop";

interface UserState {
  name: string;
  bio?: string;
  frameworks?: string;
  languages?: string;
  img?: string;
  email: string;
  isauth: boolean;
  intrests?: string[];
}

interface FormData {
  name: string;
  bio: string;
  frameworks: string;
  languages: string;
  img: string;
  intrests: string[];
}

const ProfilePage = () => {
  const user = useAppSelector((state: { user: UserState }) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: user.name || "",
    bio: user.bio || "",
    frameworks: user.frameworks || "",
    languages: user.languages || "",
    img: user.img || "",
    intrests: Array.isArray(user.intrests)
      ? user.intrests
      : (user.intrests || "").split(", ") || [],
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // States for cropping modal
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!user.isauth) {
      router.push("/login");
    }
  }, [user.isauth, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (img: string) => {
    setLoading(true);
    try {
      const fetchdata = await fetch("/api/profile", {
        method: "POST",
        body: JSON.stringify({ ...formData, email: user.email, img: img }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await fetchdata.json();
      setLoading(false);
      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        dispatch(
          add({
            name: response.data.name,
            bio: response.data.bio,
            frameworks: response.data.frameworks,
            languages: response.data.languages,
            img: response.data.img,
            email: response.data.email,
            isauth: true,
            intrests: response.data.intrests,
          })
        );
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error("Error while updating profile");
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
  ) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Ensure the output is also 4x4 ratio (square)
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    if (!ctx) return null;

    // PixelCrop contains the portion of the image that should be cropped
    // We draw that portion onto our canvas of fixed size (400x400)
    // This ensures a final square result.
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      size,
      size
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const uploadCroppedImage = async (blob: Blob) => {
    setLoading(true);
    const data = new FormData();
    data.append("file", blob);
    data.append("upload_preset", "ml_default");
    data.append("cloud_name", "db0x5vhbk");

    fetch("https://api.cloudinary.com/v1_1/db0x5vhbk/image/upload", {
      method: "post",
      body: data,
    })
      .then((resp) => resp.json())
      .then((data) => {
        setLoading(false);
        toast.success("Image uploaded successfully");
        handleSubmit(data.url);
        setShowCropModal(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error("Error while uploading image");
      });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      setImageSrc(event.target.result as string);
      setShowCropModal(true); // Show the modal to crop
    };

    reader.onerror = () => {
      toast.error("Error reading file.");
    };

    reader.readAsDataURL(file);
  };

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      toast.error("Crop area not determined");
      return;
    }
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
    if (!blob) {
      toast.error("Error cropping image.");
      return;
    }
    uploadCroppedImage(blob);
  };

  const handleResizeWithoutCropping = async () => {
    // Directly resize the entire image to 400x400 without cropping
    // This means we ignore the cropping tool and just use the image as-is.
    if (!imageSrc) return;
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    if (!ctx) return;

    // Draw the entire image scaled to 400x400
    ctx.drawImage(image, 0, 0, size, size);

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Error resizing image.");
        return;
      }
      uploadCroppedImage(blob);
    }, "image/jpeg");
  };

  return (
    <div className="min-h-screen dark:bg-black bg-white dark:bg-grid-white/[0.2] bg-grid-black/[0.2] flex items-center justify-center">
      <Toaster richColors />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="lg:w-[80rem] sm:w-[22rem] mt-10 mb-10 rounded-none md:rounded-2xl p-4 md:p-8 shadow-input backdrop-blur-sm border border-gray-900 relative">
        <h2 className="font-bold text-3xl text-center text-neutral-800 dark:text-neutral-200">
          Your Profile
        </h2>
        <p className="text-neutral-600 text-center text-lg mt-2 dark:text-neutral-300">
          View and edit your profile information below.
        </p>

        {isEditing ? (
          // Edit Mode
          <div className="my-8 relative">
            <div className="flex flex-col items-center mb-8">
              <img
                src={formData.img || "/profile.jpg"}
                alt="Profile Photo"
                width={96}
                height={96}
                className="rounded-full mb-4 border-purple-500 border-2 object-cover"
              />
              <label className="block relative group cursor-pointer">
                <span className="sr-only">Choose profile photo</span>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="flex items-center justify-center bg-violet-50 text-violet-700 hover:bg-violet-100 p-2 rounded-full shadow-md">
                  <FaUpload className="text-lg" />
                  <span className="ml-2 text-sm font-medium">Upload Photo</span>
                  {loading && (
                    <Loader2 className="mx-2 mr-2 h-5 w-5 animate-spin" />
                  )}
                </div>
              </label>
            </div>

            {/* Name */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            {/* Email (non-editable) */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                placeholder="Your Email"
                value={user.email}
                disabled
              />
            </LabelInputContainer>

            {/* Selected Domains */}
            <div className="mb-4">
              <Label>Selected Domains</Label>
              <div className="flex flex-col space-y-2 mt-2">
                {[
                  "AI/ML",
                  "Blockchain",
                  "Fullstack",
                  "Cloud/DevOps",
                  "AR/VR",
                  "Cybersecurity",
                ].map((interest) => (
                  <label key={interest} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="intrests"
                      value={interest}
                      checked={formData.intrests.includes(interest)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          intrests: prev.intrests.includes(value)
                            ? prev.intrests.filter(
                                (item: string) => item !== value
                              )
                            : [...prev.intrests, value],
                        }));
                      }}
                      className="form-checkbox text-indigo-600"
                    />
                    <span className="ml-2 text-neutral-800 dark:text-neutral-200">
                      {interest}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bio */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleInputChange}
                className="rounded-md border border-gray-300 dark:border-gray-700 p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                rows={4}
              />
            </LabelInputContainer>

            {/* Frameworks Known */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="frameworks">Frameworks Known</Label>
              <Input
                id="frameworks"
                name="frameworks"
                placeholder="e.g., React, Vue, Angular"
                value={formData.frameworks}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            {/* Languages */}
            <LabelInputContainer className="mb-4">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                name="languages"
                placeholder="e.g., JavaScript, Python"
                value={formData.languages}
                onChange={handleInputChange}
              />
            </LabelInputContainer>

            {/* Save and Cancel Buttons */}
            <div className="flex space-x-4">
              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
              dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white
              rounded-md h-10 font-medium"
                onClick={() => handleSubmit(formData.img)}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Changes"
                )}
                <ButtonGradient />
              </button>

              <button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
              dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white
              rounded-md h-10 font-medium"
                onClick={() => setIsEditing(false)}
              >
                Cancel
                <ButtonGradient />
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="my-8 relative">
            <div className="flex flex-col items-center mb-8">
              <img
                src={user.img || "/profile.jpg"}
                alt="Profile Photo"
                width={120}
                height={120}
                className="rounded-full border border-purple-500 mb-4 object-cover"
              />
            </div>

            <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
              {/* Name */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Name:
                </Label>
                <p className="lg:text-2xl sm:text-xl font-bold text-gray-800 dark:text-gray-100">
                  {user.name}
                </p>
              </div>

              {/* Email */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Email:
                </Label>
                <p className="lg:text-2xl sm:text-xl text-gray-800 dark:text-gray-100">
                  {user.email}
                </p>
              </div>

              {/* Selected Domain */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Selected Domain:
                </Label>
                <p className="lg:text-2xl sm:text-xl text-gray-800 dark:text-gray-100">
                  {user.intrests?.join(", ")}
                </p>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Bio:
                </Label>
                <p className="lg:text-2xl sm:text-xl text-gray-800 dark:text-gray-100">
                  {user.bio}
                </p>
              </div>

              {/* Frameworks Known */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Frameworks Known:
                </Label>
                <p className="lg:text-2xl sm:text-xl text-gray-800 dark:text-gray-100">
                  {user.frameworks}
                </p>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <Label className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  Languages:
                </Label>
                <p className="lg:text-2xl sm:text-xl text-gray-800 dark:text-gray-100">
                  {user.languages}
                </p>
              </div>

              {/* Edit Profile Button */}
              <div className="flex items-center justify-center text-center mt-4">
                <button
                  className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
    dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-1/2 text-white
    rounded-md h-10 font-medium"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                  <ButtonGradient />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCropModal && (
        <div className="fixed inset-0 flex items-center top-20 justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-gray-200">
              Adjust your photo
            </h3>
            <div className="relative w-full h-64 sm:h-72 md:h-80 bg-black dark:bg-gray-800">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // 1:1 ratio for 4x4 cropping
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  objectFit="contain"
                />
              )}
            </div>

            {/* Zoom Slider */}
            <div className="flex flex-col items-center mt-4">
              <Label className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Zoom
              </Label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleCrop}
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
    dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 text-white font-medium py-2 px-4 rounded-md w-full"
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cropping...
                  </div>
                ) : (
                  "Crop"
                )}
                <ButtonGradient />
              </button>
              <button
                onClick={handleResizeWithoutCropping}
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
    dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 text-white font-medium py-2 px-4 rounded-md w-full"
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resizing...
                  </div>
                ) : (
                  "Just Resize"
                )}
                <ButtonGradient />
              </button>
            </div>

            <button
              onClick={() => setShowCropModal(false)}
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
    dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 text-white font-medium py-2 px-4 rounded-md w-full mt-4"
              disabled={loading}
            >
              Cancel
              <ButtonGradient />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
