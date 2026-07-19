function RegisterInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  error,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-[14px] font-semibold text-[#222]">
          {label}
        </label>
        {error && (
          <span className="text-xs text-red-600 font-semibold animate-in fade-in duration-200">
            {error}
          </span>
        )}
      </div>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        className={`w-full h-[48px] border rounded-md px-4 bg-white text-[#111] outline-none transition-all ${
          error ? "border-red-500 focus:border-red-600" : "border-[#cfd6d2] focus:border-[#00783f]"
        }`}
      />
    </div>
  );
}

export default RegisterInput;