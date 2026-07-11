import RegisterInput from "./RegisterInput";
import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

const roleFields ={
     Team: [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter full name" },
    { label: "Email", name: "email", type: "email", placeholder: "example@gmail.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
    { label: "Profile Picture", name: "profilePicture", type: "file" },
    { label: "Contact Number", name: "contactNumber", type: "tel", placeholder: "+94 7X XXX XXXX" },
    { label: "District", name: "district", type: "text", placeholder: "Enter district" },
  ],

  Sponsor: [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter full name" },
    { label: "Email", name: "email", type: "email", placeholder: "example@gmail.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
    { label: "Profile Picture", name: "profilePicture", type: "file" },
    { label: "Company Name", name: "companyName", type: "text", placeholder: "Enter company name" },
    { label: "Contact Person", name: "contactPerson", type: "text", placeholder: "Enter contact person name" },
    { label: "Contact Number", name: "contactNumber", type: "tel", placeholder: "+94 7X XXX XXXX" },
    { label: "Address", name: "address", type: "text", placeholder: "Enter address" },
  ],

  Referee: [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter full name" },
    { label: "Email", name: "email", type: "email", placeholder: "example@gmail.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
    { label: "Profile Picture", name: "profilePicture", type: "file" },
    { label: "Contact Number", name: "contactNumber", type: "tel", placeholder: "+94 7X XXX XXXX" },
    { label: "Experience Years", name: "experienceYears", type: "number", placeholder: "Enter experience years" },
  ],

  Playground: [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter full name" },
    { label: "Email", name: "email", type: "email", placeholder: "example@gmail.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
    { label: "Profile Picture", name: "profilePicture", type: "file" },
    { label: "Playground Name", name: "playgroundName", type: "text", placeholder: "Enter playground name" },
    { label: "Location", name: "location", type: "text", placeholder: "Enter location" },
    { label: "Address", name: "address", type: "text", placeholder: "Enter address" },
    { label: "Capacity", name: "capacity", type: "number", placeholder: "Enter capacity" },
    { label: "Contact Number", name: "contactNumber", type: "tel", placeholder: "+94 7X XXX XXXX" },
  ],

  Organizer: [
    { label: "Full Name", name: "fullName", type: "text", placeholder: "Enter full name" },
    { label: "Email", name: "email", type: "email", placeholder: "example@gmail.com" },
    { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
    { label: "Profile Picture", name: "profilePicture", type: "file" },
    { label: "Organization Name", name: "organizationName", type: "text", placeholder: "Enter organization name" },
    { label: "Contact Number", name: "contactNumber", type: "tel", placeholder: "+94 7X XXX XXXX" },
    { label: "Address", name: "address", type: "text", placeholder: "Enter address" },
  ],
};

function RegisterForm({selectedRole}){
    const [agreed, setAgreed] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const fields = roleFields[selectedRole] || [];

    const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  password: "",
  profilePicture: null,
  contactNumber: "",
  district: "",
  address: "",
  companyName: "",
  contactPerson: "",
  experienceYears: "",
  location: "",
  capacity: "",
  playgroundName: "",
  organizationName: "",
});

 function handleChange(e) {
  const { name, value, type, files } = e.target;

  if (type === "file") {
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  } else {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
}

function validateForm() {
  const fields = roleFields[selectedRole] || [];

  for (let field of fields) {
    if (!formData[field.name]) {
      alert(`${field.label} is required`);
      return false;
    }
  }

  const phoneRegex = /^(\+94|0)[0-9]{9}$/;

  if (!phoneRegex.test(formData.contactNumber)) {
    alert("Enter a valid Sri Lankan phone number");
    return false;
  }

  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters");
    return false;
  }

  return true;
}

function getRoleFormData() {
  const fields = roleFields[selectedRole] || [];

  const roleData = {
    role: selectedRole,
  };

  fields.forEach((field) => {
    roleData[field.name] = formData[field.name];
  });

  return roleData;
}

function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const finalData = getRoleFormData();
  // Backend expects role in uppercase (e.g. "ORGANIZER")
  finalData.role = finalData.role.toUpperCase();

  console.log("Sending JSON to backend...", finalData);
  
  // Call the backend API
  api.post('/user/register', finalData)
  .then((response) => {
    console.log("Registration Success:", response.data);
    setSuccessMessage("Registration successful! Redirecting to login...");
    setErrorMessage("");
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  })
  .catch((error) => {
    console.error("Registration Error:", error);
    setErrorMessage("Registration failed. Please try again.");
    setSuccessMessage("");
  });
}

  return (
    <section className="w-full max-w-[720px] mx-auto border border-[#cfd6d2] rounded-md p-6 md:p-10 bg-[#f8f7f4]">
      <h2 className="text-[26px] font-bold text-[#171917]">
        {selectedRole} Registration
      </h2>

      <p className="mt-1 text-[#4b4f4d]">
        Complete your {selectedRole.toLowerCase()} profile to get started.
      </p>

      <hr className="my-8 border-[#d6d8d4]" />

      {successMessage && (
        <div className="mb-6 bg-[#eaf1ec] border border-[#00783f] text-[#00783f] px-4 py-3 rounded-md text-[15px] font-bold text-center">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-[15px] font-bold text-center">
          {errorMessage}
        </div>
      )}

      {/* Form Start here */}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-[14px] font-semibold text-[#222]">
            Selected Role
          </label>

          <input
            value={selectedRole}
            readOnly
            className="w-full h-[48px] border border-[#cfd6d2] rounded-md px-4 bg-white text-[#00783f] font-semibold"
          />
        </div>

        {fields.map((field) => (
              <RegisterInput
                 key={field.name}
                 label={field.label}
                 name={field.name}
                 type={field.type}
                 placeholder={field.placeholder}
                 value={formData[field.name] || ""}
                 onChange={handleChange}
              />
        ))}

         {/*ur Terms Agreed*/}

        <div className="col-span-1 sm:col-span-2 flex items-start sm:items-center gap-3 mt-3">
  <input
    id="terms"
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
    className="
      w-[18px]
      h-[18px]
      cursor-pointer
      accent-[#00783f]
    "
  />

  <label
    htmlFor="terms"
    className="text-[13px] text-[#222] cursor-pointer"
  >
    I agree to the{" "}
    <a
      href="#"
      className="text-[#006b3c] font-semibold underline hover:text-[#009653]"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="#"
      className="text-[#006b3c] font-semibold underline hover:text-[#009653]"
    >
      Privacy Policy
    </a>{" "}
    of The Elle Hub.
  </label>
</div>

       <button
  type="submit"
  disabled={!agreed}
  className={`
    col-span-1 sm:col-span-2
    mt-6
    h-[58px]
    rounded-md
    text-[22px]
    font-bold
    transition-all
    duration-150

    ${
      agreed
        ? `
          bg-[#003326]
          text-[#8eb7a7]
          cursor-pointer
          hover:bg-[#08733e]
          hover:shadow-lg
          hover:-translate-y-[2px]
          active:translate-y-[2px]
          active:scale-[0.98]
          active:shadow-sm
        `
        : `
          bg-[#d8d8d8]
          text-[#888]
          cursor-not-allowed
        `
    }
  `}
>
  Complete Registration
  <span className="ml-4">→</span>
</button>
      </form>
    </section>
  );

}

export default RegisterForm;