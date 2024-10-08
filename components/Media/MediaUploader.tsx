"use client";
import { uploadToCloudinary } from "@/app/actions/cloudinary.actions";
import { cn, convertImageToBase64, getImageDimensions } from "@/lib/utils";
import { REDIRECTION } from "@/types";
import { Transformation, TRANSFORMATION_TYPE } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Dropzone from "react-dropzone";
import { useServerAction } from "zsa-react";

type MediaUploaderProps = {
  imageProps?: Transformation | null;
  redirectTo: REDIRECTION;
  transformationType: TRANSFORMATION_TYPE;
};

const MediaUploader = ({
  imageProps,
  redirectTo,
  transformationType,
}: MediaUploaderProps) => {
  const router = useRouter();

  const { isPending, execute } = useServerAction(uploadToCloudinary);

  const onDrop = async <T extends File>(acceptedFiles: T[]) => {
    const file = acceptedFiles[0];

    const { height, width } = await getImageDimensions(file);

    const base64 = await convertImageToBase64(file);
    const transformation = await execute({
      file: base64,
      height,
      width,
      type: transformationType,
    });

    router.push(`/${redirectTo}/update/${transformation[0]?.id}`);
  };

  return (
    <>
      <Dropzone
        onDrop={onDrop}
        accept={{
          "image/png": [".png", ".jpeg", ".jpg", ".gif", ".webp"],
        }}
        multiple={false}
      >
        {({ getRootProps, getInputProps }) => (
          <section className="w-full">
            <div
              {...getRootProps()}
              className={cn(
                "h-[250px] w-full p-4 rounded-xl block transition-all border border-border shadow-lg bg-background/80",
                !imageProps?.imageURL && !isPending
                  ? "hover:scale-105 cursor-pointer"
                  : ""
              )}
            >
              <div className="h-full w-full rounded-xl border-2 border-dashed border-secondary flex items-center justify-center">
                {imageProps?.imageURL && (
                  <>
                    <div className="p-2 rounded-lg relative">
                      <Image
                        src={imageProps?.imageURL}
                        height={300}
                        width={300}
                        alt="Original Image"
                      />
                    </div>
                  </>
                )}
                {!isPending ? (
                  !imageProps?.imageURL && "Select or drop your image here.."
                ) : (
                  <>
                    <Image
                      src="/images/loader.svg"
                      alt="Loader"
                      height={36}
                      width={36}
                    />
                    &nbsp;Uploading...
                  </>
                )}
              </div>
              {!imageProps?.imageURL && !isPending && (
                <input {...getInputProps()} />
              )}
            </div>
          </section>
        )}
      </Dropzone>
    </>
  );
};

export default MediaUploader;
