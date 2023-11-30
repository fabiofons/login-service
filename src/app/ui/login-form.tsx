"use client";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { client } from "@/app/services/axiosClient";
import { camelizeKeys } from "humps";
import useAuthStore from "@/app/store/authStore";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

type Inputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setRefreshToken = useAuthStore((state) => state.setRefreshToken);
  const setExpiredAt = useAuthStore((state) => state.setExpiredAt);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const { mutate } = useMutation({
    mutationFn: (data: Inputs) =>
      client.post("/clients/session", { session: data }),
    onSuccess: (data) => {
      const dataCamelized = camelizeKeys(data.data);
      const { access, refresh, accessExpiresAt } = dataCamelized;
      setAccessToken(access);
      setRefreshToken(refresh);
      setExpiredAt(accessExpiresAt);
      const role = jwtDecode<{ kind: string }>(access).kind.replace("_", "-");
      router.push(`/${role}s/dashboard/`);
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => mutate(data);
  return (
    <div className="flex justify-center">
      <form
        className="space-y-3 max-w-[500px] flex-1 border p-5 rounded-lg"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                type="email"
                id="email"
                placeholder="Enter your email address"
                autoComplete="email"
                {...register("email", { required: true })}
                aria-describedby="email-error"
              />
            </div>
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {errors.email && (
                <p className="mt-2 text-sm text-red-500">
                  this field is required
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                type="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register("password", { required: true })}
                aria-describedby="password-error"
              />
            </div>
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {errors.password && (
                <p className="mt-2 text-sm text-red-500">
                  this field is required
                </p>
              )}
            </div>
          </div>
        </div>
        <button
          className="bg-cyan-400 text-gray-900 rounded-md px-7 py-3"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}
