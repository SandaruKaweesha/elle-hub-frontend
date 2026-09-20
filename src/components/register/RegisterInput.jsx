import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function RegisterInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  error,
  accept,
  options = [],
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password" || name === "password";
  const isProfileFile = type === "file" && name === "profilePicture";
  const fileAccept = accept || (isProfileFile ? ".jpg,.jpeg,.png,image/jpeg,image/png" : undefined);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[14px] font-semibold text-[#222]">
          {label}
        </label>
      </div>

      {type === "select" ? (
        <select
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full h-[48px] border rounded-md px-4 bg-white text-[#111] outline-none transition-all cursor-pointer ${
            error ? "border-red-500 focus:border-red-600 ring-1 ring-red-500" : "border-[#cfd6d2] focus:border-[#00783f]"
          }`}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative w-full">
          <input
            name={name}
            type={inputType}
            accept={fileAccept}
            placeholder={placeholder}
            required={required}
            value={type === "file" ? undefined : value}
            onChange={onChange}
            className={`w-full h-[48px] border rounded-md px-4 bg-white text-[#111] outline-none transition-all flex items-center justify-center py-2 ${
              isPassword ? "pr-11" : ""
            } ${
              error ? "border-red-500 focus:border-red-600 ring-1 ring-red-500" : "border-[#cfd6d2] focus:border-[#00783f]"
            }`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00783f] transition-colors p-1.5 rounded-md focus:outline-none cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 font-bold animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
}

export default RegisterInput;