import { FC } from 'react';
import Image from 'next/image';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    src: string;
    alt: string;
}

const ImageModal: FC<ImageModalProps> = ({ isOpen, onClose, src, alt }) => {
    if (!isOpen) return null; // Don't render the modal if it's not open

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative w-3/4 h-3/4">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 m-4 text-white text-2xl"
                >
                    &times;
                </button>
                <Image
                    src={src}
                    alt={alt}
                    className="rounded-md"
                    layout="fill"
                    objectFit="contain"
                    onClick={onClose} // Optionally allow clicking on the image to close the modal
                />
            </div>
        </div>
    );
};

export default ImageModal;
