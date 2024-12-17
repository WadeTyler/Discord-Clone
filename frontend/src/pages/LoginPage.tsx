import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { LoadingSpinnerMD } from "../components/lib/util/LoadingSpinner";

const LoginPage = () => {

  // API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // QueryClient
  const queryClient = useQueryClient();


  // States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Functions

  const { mutate:loginUser, isPending:attemptingLogin } = useMutation({
    mutationFn: async ({email, password}: {email: string, password: string}) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email, password}),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        return data;

      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      toast.success("Logged in successfully!");
    }
  });


  const handleLoginSubmit = () => {
    loginUser({email, password});
  }


  return (
    <div className="w-full h-screen flex justify-center items-center relative" style={{
      backgroundImage: `url("./login-background.webp")`,
    }}>
      
      {/* Label */}
      <img src="./discord-logo.svg" alt="Discord Logo" className="w-36 absolute top-12 left-12"/>

      <div className="bg-primary w-[40rem] p-6 rounded flex flex-col items-center">

        <h1 className="text-white font-bold text-2xl mb-2">Welcome back!</h1>
        <p className="text-accentDark text-sm mb-2">We're so excited to see you again!</p>

        <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLoginSubmit();
        }}
        className="flex flex-col w-full gap-6">

          <section className="flex flex-col gap-2 w-full">
            <label htmlFor="email" className="font-bold text-accentDark text-xs">EMAIL OR PHONE NUMBER <span className="text-red-400">*</span></label>
            <input type="email" id="email" className="p-2 rounded bg-tertiary focus:outline-none" onChange={(e) => setEmail(e.target.value)}/>
          </section>

          <section className="flex flex-col gap-2 w-full">
            <label htmlFor="email" className="font-bold text-accentDark text-xs">PASSWORD<span className="text-red-400">*</span></label>
            <input type="password" id="password" className="p-2 rounded bg-tertiary focus:outline-none" onChange={(e) => setPassword(e.target.value)}/>
            <p className="text-xs text-blue-400 font-semibold">Forgot your password?</p>
          </section>

          {attemptingLogin ? <section className="text-center"> <LoadingSpinnerMD /> </section> : 
            <button className="w-full bg-accentBlue text-white p-2 rounded">
              Log in
            </button> 
          }

          <p className="text-accentDark text-xs">Need an account? <span className="text-blue-400"> Register</span></p>

        </form>



      </div>



    </div>
  )
}

export default LoginPage