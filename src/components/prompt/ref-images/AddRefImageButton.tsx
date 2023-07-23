import { Button, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { TbFileUpload } from "react-icons/tb";
import { sendIpcMessage } from "../../../backend-listener";

const AddRefImageButton = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const handleClick = () => inputRef.current?.click();
  const toast = useToast();

  useEffect(() => {
    if (files) {
      sendIpcMessage({
        type: "ADD_REF_IMAGES",
        data: Array.from(files).map((f) => f.path),
      });
      setFiles(null);
      toast({
        title: "Uploading images",
        description: "The images will be available in a moment",
        status: "success",
        duration: 10000,
        position: "top",
      });
    }
  }, [files]);

  return (
    <>
      <input
        type={"file"}
        multiple
        hidden
        accept="image/*"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files) {
            setFiles(e.target.files);
          }
        }}
      />
      <Button
        mr={4}
        leftIcon={<TbFileUpload />}
        colorScheme="blackAlpha"
        bg="blackAlpha.800"
        onClick={handleClick}
      >
        Add images
      </Button>
    </>
  );
};

export default AddRefImageButton;
