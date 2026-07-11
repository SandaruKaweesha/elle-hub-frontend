function RoleCard({ icon, title, description }){
    return(
     
      <div className="w-[210px] h-[155px] border border-[#cfd6d2] rounded-md bg-[#f8f7f4] flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#00783f] hover:shadow-md transition-all duration-300">
       <div className="text-[28px] mb-3">{icon}</div>

       <h3 className="text-[22px] font-bold text-[#111111]"> {title}</h3>

       <p className="mt-2 text-[11px] leading-[1.25] text-[#6b716e] w-[150px]">{description}</p>


      </div>

    );
}
export default RoleCard;