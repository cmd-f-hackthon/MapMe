import Image from "next/image";

interface PolaroidImageProps {
    title: string; // define the prop type
}

export function PolaroidImage({ title }: PolaroidImageProps) {
  return (
    <div className="w-55 h-60 bg-white p-2 border border-gray-200 shadow-md transform-gpu flex flex-col items-center justify-center">
      <div className="relative w-48 h-48"> {/* Image container */}
        <Image
          src="/tree.jpg" // Ensure the image is in the public folder
          alt="Polaroid Image"
          fill
          className="object-cover"
        />
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">{title}Placeholder Text</p>
    </div>
  );
}