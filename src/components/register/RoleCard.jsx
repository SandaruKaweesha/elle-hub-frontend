function RoleCard({
  Icon,
  title,
  description,
  isSelected,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`
        w-full sm:w-[250px]
        h-[190px]
        border
        rounded-[7px]
        bg-[#f8f7f4]
        flex
        flex-col
        items-center
        justify-center
        text-center
        cursor-pointer
        transition-all
        duration-300

        ${
          isSelected
            ? "border-[#00783f]"
            : "border-[#cfd6d2] hover:border-[#00783f]"
        }
      `}
    >
      <Icon
        size={38}
        strokeWidth={2.4}
        className={`
          mb-4
          transition-colors
          duration-300
          ${
            isSelected
              ? "text-[#00783f]"
              : "text-[#4b514e]"
          }
        `}
      />

      <h3
        className={`
          text-[24px]
          font-bold
          transition-colors
          duration-300
          ${
            isSelected
              ? "text-[#00783f]"
              : "text-[#111111]"
          }
        `}
      >
        {title}
      </h3>

      <p className="mt-2 text-[13px] leading-[1.3] text-[#737875] w-[190px]">
        {description}
      </p>
    </div>
  );
}

export default RoleCard;