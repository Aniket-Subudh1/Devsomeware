"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
  useModal,
} from "../ui/animated-modal"; 
import { LucideIcon } from "lucide-react";

type EventRegistrationModalProps = {
  title: string;
  date: string;
  highlights: string[];
  icon: LucideIcon;
  onConfirm?: () => void;
};

export function EventRegistrationModal({
  title,
  date,
  highlights,
  icon: IconComponent,
  onConfirm,
}: EventRegistrationModalProps) {
  
  return (
    <Modal>
      {/** Modal Trigger (the button that opens the modal) */}
      <ModalTrigger className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" />
          <span>Register</span>
        </div>
      </ModalTrigger>

      {/** The main body of the modal, shown when open = true */}
      <ModalBody>
      <ModalContent className="text-gray-800 dark:text-gray-100 text-left">
  <h2 className="text-xl font-bold mb-2">{title}</h2>
  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
    <strong>Date:</strong> {date}
  </p>

          {!!highlights?.length && (
            <ul className="list-disc list-inside text-sm mb-6">
              {highlights.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          )}

          <p className="text-sm">
            Click <strong>Yes</strong> to confirm your participation in{" "}
            <em>{title}</em>.
          </p>
        </ModalContent>

        <ModalFooter className="flex gap-4 justify-end">
          <NoButton />
          <YesButton onConfirm={onConfirm} title={title} />
        </ModalFooter>
      </ModalBody>
    </Modal>
  );
}

function NoButton() {
  const { setOpen } = useModal();

  const handleNo = () => {
    console.log("User clicked NO");
    setOpen(false);
  };

  return (
    <button
      onClick={handleNo}
      className="px-3 py-1 rounded-md border border-gray-400 
                 dark:border-gray-600 text-sm"
    >
      No
    </button>
  );
}

function YesButton({ onConfirm, title }: { onConfirm?: () => void; title: string }) {
  const { setOpen } = useModal();

  const handleYes = () => {
    console.log(`User clicked YES for "${title}"`);
    if (onConfirm) onConfirm();
    setOpen(false);
  };

  return (
    <button
      onClick={handleYes}
      className="px-3 py-1 rounded-md border border-black bg-black text-white 
                 dark:border-white dark:bg-white dark:text-black text-sm"
    >
      Yes
    </button>
  );
}
