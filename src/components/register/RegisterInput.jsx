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
  const isProfileFile = type === "file" && name === "profilePicture";
  const fileAccept = accept || (isProfileFile ? ".jpg,.jpeg,.png,image/jpeg,image/png" : undefined);

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
        <input
          name={name}
          type={type}
          accept={fileAccept}
          placeholder={placeholder}
          required={required}
          value={type === "file" ? undefined : value}
          onChange={onChange}
          className={`w-full h-[48px] border rounded-md px-4 bg-white text-[#111] outline-none transition-all flex items-center justify-center py-2 ${
            error ? "border-red-500 focus:border-red-600 ring-1 ring-red-500" : "border-[#cfd6d2] focus:border-[#00783f]"
          }`}
        />
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