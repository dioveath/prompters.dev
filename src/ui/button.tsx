import { cva, type VariantProps } from "class-variance-authority";

const button = cva("cursor-pointer px-8 py-1 rounded-full", {
  variants: {
    intent: {
      primary: "bg-purple-600 text-white",
      secondary: "bg-gray-200 text-black",
    },
    isLoading: {
      true: "opacity-50 cursor-not-allowed animate-pulse",
    }    
  },
  defaultVariants: {
    intent: "primary",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export default function Button({ children, intent, type, ...props }: ButtonProps) {
  return (
    <button className={button({ intent })} {...props} type={type || "button"}>
      {children}
    </button>
  );
}
