function RegisterInput({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
}) {
  return (
    <div>
      <label className="block mb-2 text-[14px] font-semibold text-[#222]">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        value={type === "file" ? undefined : value}
        onChange={onChange}
        className="w-full h-[48px] border border-[#cfd6d2] rounded-md px-4 bg-white text-[#111] outline-none focus:border-[#00783f]"
      />
    </div>
  );
}

export default RegisterInput;