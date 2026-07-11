
import Navbar from "../components/common/Navbar";
import RoleCard from "../components/register/RoleCard";
import RegisterForm from "../components/register/RegisterForm";
import { useState, useRef } from "react";
import Footer from "../components/common/Footer";

import {
  UsersRound,
  CalendarDays,
  Shield,
  Handshake,
  LandPlot
} from "lucide-react";

function Register() {

  const [selectedRole, setSelectedRole] = useState("");
  const formRef = useRef(null);

function handleRoleClick(role) {
  setSelectedRole(role);

  setTimeout(() => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
     });
    }, 100);
  }
    
   
  return (
  <div
  className={`bg-[#f8f7f4] ${
    selectedRole ? "min-h-screen overflow-y-auto" : "h-screen overflow-hidden"
  }`}
>
      <Navbar />

      <main className="h-[calc(100vh-64px)] flex flex-col">

        <section className="text-center pt-[70px] px-4 font-['Poppins']">
          <h1 className="text-4xl md:text-[48px] font-extrabold tracking-[-1.5px] text-[#171917] leading-[1.1]">
            Join the Elite.{" "}
            <span className="text-[#00783f]">
              Choose Your Role.
            </span>
          </h1>

          <p className="mt-[22px] text-[17px] text-[#303532] leading-[1.55]">
            Be part of the most prestigious sports management platform in Sri Lanka.
            <br />
            Whether you're taking the field or leading the charge, your journey starts here.
          </p>
        </section>

      <section className="flex justify-center px-6 mt-10 md:mt-[95px] pb-10 md:pb-[70px]">
         <div className="flex justify-center gap-[24px] flex-wrap">

    <RoleCard
      Icon={UsersRound}
      title="Team"
      description="Register your squad for upcoming tournaments."
      isSelected={selectedRole === "Team"}
      onClick={() => handleRoleClick("Team")}
      
    />

    <RoleCard
      Icon={CalendarDays}
      title="Organizer"
      description="Manage events, schedules, and brackets with ease."
      isSelected={selectedRole === "Organizer"}
      onClick={() => handleRoleClick("Organizer")}
    />

    <RoleCard
      Icon={Shield}
      title="Referee"
      description="Ensure fair play and accurate match reporting."
      isSelected={selectedRole === "Referee"}
      onClick={() => handleRoleClick("Referee")}
    />

    <RoleCard
      Icon={Handshake}
      title="Sponsor"
      description="Boost your brand presence in the local ecosystem."
      isSelected={selectedRole === "Sponsor"}
      onClick={() => handleRoleClick("Sponsor")}
    />

    <RoleCard
  Icon={LandPlot}
  title="Playground"
  description="List and manage playground availability and bookings."
  isSelected={selectedRole === "Playground"}
  onClick={() => handleRoleClick("Playground")}
/>

  </div>
        </section>
      {selectedRole && (
     <div ref={formRef} className="pt-[40px] pb-[80px]">
         <RegisterForm selectedRole={selectedRole} />
      </div>
)}
     {selectedRole && <Footer />}

      </main>
    </div>

    
  );

}

export default Register;    