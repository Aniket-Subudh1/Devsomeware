"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}


interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);


function ModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a <ModalProvider>");
  }
  return ctx;
}


export function Modal({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

export function ModalTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { setOpen } = useModal();

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md  dark:text-purple-500 text-center relative overflow-hidden",
        className
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
}

export function ModalBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open, setOpen } = useModal();
  const modalRef = useRef<HTMLDivElement>(null);

 
  useEffect(() => {
    if (open) {
    
    } else {
      document.body.style.overflow = "auto";
    }
  }, [open]);


  useOutsideClick(modalRef, () => setOpen(false));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        >
          {/* The dark overlay */}
          <Overlay />

          {/* The modal container */}
          <motion.div
            ref={modalRef}
            className={cn(
              "relative z-50 flex flex-col w-[90%] max-w-[30rem] bg-white dark:bg-neutral-950",
              "border border-transparent dark:border-neutral-800 rounded-xl",
              "overflow-hidden",
              className
            )}
            initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            {/* X Close Icon in top-right */}
            <CloseButton />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("p-6 flex-1", className)}>{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4 bg-gray-100 dark:bg-neutral-900", className)}>
      {children}
    </div>
  );
}

function Overlay() {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
}


function CloseButton() {
  const { setOpen } = useModal();

  return (
    <button
      onClick={() => setOpen(false)}
      className="absolute top-4 right-4 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black dark:text-white h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
      >
        <path stroke="none" d="M0 0h24v24H0z" />
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  );
}

function useOutsideClick(
  ref: React.RefObject<HTMLDivElement | null>,
  callback: (ev?: any) => void
) {
  useEffect(() => {
    const handleClick = (ev: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(ev.target as Node)) {
        return;
      }
      callback(ev);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [ref, callback]);
}
