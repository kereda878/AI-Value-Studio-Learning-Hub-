import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[#A0A0A0] text-xs font-medium mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6A6A6A] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg py-2.5 text-[#F0F0F0] text-sm",
            "placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#F45B69]/60",
            icon ? "pl-9 pr-4" : "px-3",
            error && "border-[#F45B69]/60",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-[#F45B69] text-xs">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[#A0A0A0] text-xs font-medium mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-[#F0F0F0] text-sm",
          "placeholder:text-[#6A6A6A] focus:outline-none focus:border-[#F45B69]/60 resize-y",
          error && "border-[#F45B69]/60",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-[#F45B69] text-xs">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className, children, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[#A0A0A0] text-xs font-medium mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg px-3 py-2.5 text-[#F0F0F0] text-sm",
          "focus:outline-none focus:border-[#F45B69]/60",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
Select.displayName = "Select";
